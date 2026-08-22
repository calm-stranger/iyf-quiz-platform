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
const { shuffleWithSeed, optionIndexList } = require('../../lib/shuffle');
const { getBank } = require('../../question-banks');

// ── Config (override via environment variables) ────────────────────────────
const FALLBACK_QUIZ_ID = 'local';
const FALLBACK_QUIZ_TITLE = 'Local Quiz';
const QUIZ_DURATION_MINUTES = parseInt(process.env.QUIZ_DURATION_MINUTES || '30', 10);
const QUIZ_DURATION_MS = QUIZ_DURATION_MINUTES * 60 * 1000;
const MAX_STUDENTS = parseInt(process.env.MAX_STUDENTS || '50', 10);

/** Lowercase, punctuation-free, stable across submissions. */
function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_|-]/g, '')
    .replace(/_+/g, '_');
}

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

  const { name, email, dob, school, quizSlug } = req.body ?? {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Invalid name.' });
  }
  if (!dob || typeof dob !== 'string') {
    return res.status(400).json({ error: 'Invalid date of birth.' });
  }

  /*
    One of school or email identifies the student alongside their name. The
    Utkarsh entry form collects a school; the standalone form collects an
    email. Either satisfies this — see studentKey below for why it matters.
  */
  const studentSchool = typeof school === 'string' ? school.trim() : '';
  const studentEmail = typeof email === 'string' ? email.trim() : '';

  if (!studentSchool && !studentEmail) {
    return res.status(400).json({ error: 'Please enter your school.' });
  }
  if (!studentSchool && !studentEmail.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const studentName = name.trim();
  const studentDob = dob.trim();

  /*
    The key that identifies a student within a quiz, and that `attempts` is
    unique on.

    It used to be the name alone, which is fine for a class of thirty and
    actively harmful at an inter-school event: the second "Rahul Sharma" to
    arrive was told he had already submitted, and locked out of his own quiz.
    Including the date of birth and the school makes a genuine collision
    require two students with the same name, born the same day, at the same
    school.
  */
  const studentKey = slugify([studentName, studentDob, studentSchool || studentEmail].join('|'));

  if (!studentKey) {
    return res.status(400).json({ error: 'Invalid name — please use letters and spaces.' });
  }

  try {
    const active = await loadActiveQuiz(quizSlug);
    if (!active || !active.questions.length) {
      return res.status(409).json({
        error: quizSlug
          ? 'This quiz is not open yet. It has either not been published, or has no questions imported. Please tell the organisers.'
          : 'No active quiz is available. Ask the admin to publish a quiz first.',
      });
    }

    const { quiz, questions } = active;
    const quizId = quiz.id;
    const quizDurationMs = quiz.duration_minutes * 60 * 1000;
    const maxStudents = quiz.max_students;

    // ── Already submitted? ─────────────────────────────────────────────────
    let existingAttempt = null;
    if (db.enabled) {
      existingAttempt = await db.findAttempt(quizId, studentKey);
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
      /* Index list comes from the question, not a fixed [0,1,2,3]. A true/false
         question has two options, and assuming four appended two undefined
         entries that rendered as empty, tappable, always-wrong boxes. */
      const optionIndices = optionIndexList(q.options);
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
      startTime: existingAttempt ? new Date(existingAttempt.started_at).getTime() : Date.now(),
      sessionQuestions,         // full data for grading
      violations: existingAttempt ? (existingAttempt.violations || 0) : 0,
      submitted: false,
    };

    if (db.enabled) {
      if (existingAttempt) {
        await db.updateAttemptSession(existingAttempt.id, sessionId);
      } else {
        await db.createAttempt({ 
          quizId, 
          studentName, 
          studentKey, 
          sessionId,
          email: studentEmail || null,
          dob: studentDob,
          school: studentSchool || null
        });
      }
    }

    // Store session (2-hour TTL is plenty for a 30-min quiz)
    await kv.set(`session:${quizId}:${studentKey}`, session, { ex: 7200 });
    // Index by sessionId so violation/submit routes can look up by it fast
    await kv.set(`sidx:${sessionId}`, { quizId, studentKey }, { ex: 7200 });
    await kv.incr(`student_count:${quizId}`);

    const clientQuestions = buildClientQuestions(questions, sessionQuestions);

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
async function loadActiveQuiz(quizSlug) {
  // With a slug the student is entering one specific quiz — their group's.
  // Without one, this is the single global active quiz, as before.
  const active = await db.getActiveQuizWithQuestions(quizSlug ? { slug: quizSlug } : {});
  if (active) return active;

  /*
    With a database configured, no active quiz is a REAL condition — the quiz
    is still a draft, or its questions were never imported. Falling through to
    the local bank here put a completely different 25-question paper in front
    of students, which looks like the quiz working and is far worse than an
    error. The fallback below is for local development only, where there is no
    database at all.
  */
  if (db.enabled) return null;

  return {
    quiz: {
      /*
        Keyed by slug, not a single constant. Every KV key is namespaced by
        quiz id — session, result, student_count — so without this each round
        shares one namespace and round 2 is refused as "already submitted".
        With Supabase the rounds are separate rows with separate ids and this
        never arises; the point is that a local run behaves the same way, since
        a local run is how anyone would check the flow before the event.
      */
      id: quizSlug || FALLBACK_QUIZ_ID,
      title: FALLBACK_QUIZ_TITLE,
      duration_minutes: QUIZ_DURATION_MINUTES,
      max_students: MAX_STUDENTS,
    },
    questions: getBank(quizSlug) || fallbackQuestions,
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
