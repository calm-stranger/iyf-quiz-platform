/**
 * POST /api/start
 * Body: { name: string }
 *
 * Creates (or resumes) a student session.
 * Returns shuffled questions (without correct answers) + session metadata.
 */

const kv = require('../../lib/store');
const fallbackQuestions = require('../../lib/questions');
const db = require('../../lib/db');
const { shuffleWithSeed } = require('../../lib/shuffle');

// ── Config (override via environment variables) ────────────────────────────
const FALLBACK_QUIZ_ID = 'local';
const FALLBACK_QUIZ_TITLE = 'Local Quiz';
const QUIZ_DURATION_MINUTES = parseInt(process.env.QUIZ_DURATION_MINUTES || '30', 10);
const QUIZ_DURATION_MS = QUIZ_DURATION_MINUTES * 60 * 1000;
const MAX_STUDENTS = parseInt(process.env.MAX_STUDENTS || '50', 10);

function generateSessionId() {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, dob } = req.body ?? {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Invalid name.' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (!dob || typeof dob !== 'string') {
    return res.status(400).json({ error: 'Invalid date of birth.' });
  }

  const studentName = name.trim();
  const studentEmail = email.trim();
  const studentDob = dob.trim();
  // Stable key derived from the name (used for KV lookups)
  const studentKey = studentName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  if (!studentKey) {
    return res.status(400).json({ error: 'Invalid name — please use letters and spaces.' });
  }

  // ── Device tracking check ─────────────────────────────────────────────
  const existingDeviceStudent = req.cookies['device_student'];
  if (existingDeviceStudent && existingDeviceStudent !== studentKey) {
    return res.status(403).json({
      error: 'You have already attempted the quiz under a different name on this device.',
    });
  }

  try {
    const active = await loadActiveQuiz();
    if (!active.questions.length) {
      return res.status(409).json({
        error: 'No active quiz is available. Ask the admin to publish a quiz first.',
      });
    }

    const { quiz, questions } = active;
    const quizId = quiz.id;
    const quizDurationMs = quiz.duration_minutes * 60 * 1000;
    const maxStudents = quiz.max_students;

    // ── Already submitted? ─────────────────────────────────────────────────
    if (db.enabled) {
      const existingAttempt = await db.findAttempt(quizId, studentKey);
      if (existingAttempt?.status === 'submitted') {
        return res.status(409).json({
          error: 'You have already submitted this quiz. Contact your teacher if this is a mistake.',
        });
      }
    }

    const existingResult = await kv.get(`result:${quizId}:${studentKey}`);
    if (existingResult) {
      return res.status(409).json({
        error: 'You have already submitted this quiz. Contact your teacher if this is a mistake.',
      });
    }

    // ── Resume existing session? ───────────────────────────────────────────
    const existingSession = await kv.get(`session:${quizId}:${studentKey}`);
    if (existingSession) {
      const clientQuestions = buildClientQuestions(questions, existingSession.sessionQuestions);
      
      res.setHeader(
        'Set-Cookie',
        `device_student=${studentKey}; Path=/; HttpOnly; Max-Age=7200; SameSite=Strict`
      );

      return res.status(200).json({
        sessionId: existingSession.sessionId,
        questions: clientQuestions,
        startTime: existingSession.startTime,
        duration: quizDurationMs,
        quizTitle: quiz.title,
      });
    }

    // ── Check student cap ─────────────────────────────────────────────────
    const studentCount = (await kv.get(`student_count:${quizId}`)) || 0;
    if (studentCount >= maxStudents) {
      return res.status(403).json({
        error: `Maximum of ${maxStudents} students reached. Contact your teacher.`,
      });
    }

    // ── Create new session ─────────────────────────────────────────────────
    const sessionId = generateSessionId();

    // Shuffle question order deterministically by student key
    const questionIndices = questions.map((_, i) => i);
    const shuffledQIndices = shuffleWithSeed(questionIndices, `${quizId}:${studentKey}`);

    // For each question also shuffle its options and record where the correct
    // answer ended up so we can grade server-side.
    const sessionQuestions = shuffledQIndices.map((qIdx) => {
      const q = questions[qIdx];
      const optionIndices = [0, 1, 2, 3];
      // Different option shuffle per question
      const shuffledOptionOrder = shuffleWithSeed(optionIndices, `${studentKey}-opts-${qIdx}`);
      const correctAnswerIndex = shuffledOptionOrder.indexOf(q.correct);

      return {
        qIdx,                   // original question index (server only)
        questionId: q.id,
        optionOrder: shuffledOptionOrder, // maps shuffled position → original index
        correctOriginalIndex: q.correct,
        correctAnswerIndex,     // which shuffled option is correct (server only)
      };
    });

    const session = {
      sessionId,
      quizId,
      quizTitle: quiz.title,
      studentName,
      studentEmail,
      studentDob,
      studentKey,
      startTime: Date.now(),
      sessionQuestions,         // full data for grading
      violations: 0,
      submitted: false,
    };

    if (db.enabled) {
      await db.createAttempt({ 
        quizId, 
        studentName, 
        studentKey, 
        sessionId,
        email: studentEmail,
        dob: studentDob
      });
    }

    // Store session (2-hour TTL is plenty for a 30-min quiz)
    await kv.set(`session:${quizId}:${studentKey}`, session, { ex: 7200 });
    // Index by sessionId so violation/submit routes can look up by it fast
    await kv.set(`sidx:${sessionId}`, { quizId, studentKey }, { ex: 7200 });
    await kv.incr(`student_count:${quizId}`);

    const clientQuestions = buildClientQuestions(questions, sessionQuestions);

    res.setHeader(
      'Set-Cookie',
      `device_student=${studentKey}; Path=/; HttpOnly; Max-Age=7200; SameSite=Strict`
    );

    return res.status(200).json({
      sessionId,
      questions: clientQuestions,
      startTime: session.startTime,
      duration: quizDurationMs,
      quizTitle: quiz.title,
    });
  } catch (err) {
    console.error('[/api/start]', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

/**
 * Strip server-only fields and build the question list sent to the browser.
 * The browser never sees correctAnswerIndex or qIdx.
 */
async function loadActiveQuiz() {
  const active = await db.getActiveQuizWithQuestions();
  if (active) return active;

  return {
    quiz: {
      id: FALLBACK_QUIZ_ID,
      title: FALLBACK_QUIZ_TITLE,
      duration_minutes: QUIZ_DURATION_MINUTES,
      max_students: MAX_STUDENTS,
    },
    questions: fallbackQuestions,
  };
}

function buildClientQuestions(questions, sessionQuestions) {
  return sessionQuestions.map((sq) => {
    const q = questions[sq.qIdx];
    return {
      question: q.question,
      options: sq.optionOrder.map((origIdx) => q.options[origIdx]),
    };
  });
}
