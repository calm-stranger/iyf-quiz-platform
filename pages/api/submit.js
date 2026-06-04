/**
 * POST /api/submit
 * Body: { sessionId: string, answers: number[], autoSubmitted?: boolean }
 *
 * answers[i] = index of the selected option for question i (shuffled order).
 *             -1 means the question was skipped.
 *
 * Grades the quiz, stores the result in KV, and cleans up the session.
 */

const kv = require('../../lib/store');
const db = require('../../lib/db');

function msToMinSec(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}m ${s}s`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, answers, autoSubmitted } = req.body ?? {};

  if (!sessionId || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Missing sessionId or answers.' });
  }

  try {
    // Resolve session
    const sessionIndex = await kv.get(`sidx:${sessionId}`);
    if (!sessionIndex) {
      return res.status(404).json({ error: 'Session not found or already expired.' });
    }

    const { quizId, studentKey } =
      typeof sessionIndex === 'string'
        ? { quizId: 'local', studentKey: sessionIndex }
        : sessionIndex;

    const session = await kv.get(`session:${quizId}:${studentKey}`) || await kv.get(`session:${studentKey}`);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.submitted) {
      return res.status(409).json({ error: 'Quiz already submitted.' });
    }

    // ── Grade ──────────────────────────────────────────────────────────────
    const { sessionQuestions } = session;
    let score = 0;
    let answeredCount = 0;

    const gradedAnswers = sessionQuestions.map((sq, i) => {
      const studentAnswer = answers[i] !== undefined ? Number(answers[i]) : -1;
      const isAnswered = studentAnswer !== -1;
      const selectedOriginalIndex = isAnswered ? sq.optionOrder?.[studentAnswer] : -1;
      const correctOriginalIndex =
        sq.correctOriginalIndex !== undefined
          ? sq.correctOriginalIndex
          : sq.optionOrder?.[sq.correctAnswerIndex];
      const isCorrect = isAnswered && selectedOriginalIndex === correctOriginalIndex;

      if (isAnswered) answeredCount++;
      if (isCorrect) score++;

      return {
        questionId: sq.questionId || sq.qIdx,
        studentAnswer,
        correctAnswer: sq.correctAnswerIndex,
        selectedOriginalIndex,
        correctOriginalIndex,
        isCorrect,
      };
    });

    const total = sessionQuestions.length;
    const timeTakenMs = Date.now() - session.startTime;
    const percentage = Math.round((score / total) * 100);

    const result = {
      studentName: session.studentName,
      studentKey: session.studentKey,
      score,
      total,
      percentage,
      answeredCount,
      timeTakenMs,
      timeTakenStr: msToMinSec(timeTakenMs),
      autoSubmitted: autoSubmitted || false,
      violations: session.violations || 0,
      submittedAt: Date.now(),
      gradedAnswers, // detailed breakdown for admin
    };

    if (db.enabled && session.quizId !== 'local') {
      const attempt = await db.getAttemptBySessionId(sessionId);
      if (attempt) {
        const answerRows = gradedAnswers.map((ga) => ({
          attempt_id: attempt.id,
          question_id: ga.questionId,
          selected_index: ga.studentAnswer,
          correct_index: ga.correctAnswer,
          is_correct: ga.isCorrect,
        }));
        await db.submitAttempt(attempt.id, result, answerRows);
      }
    }

    // Store a local/fast copy for the current admin view.
    await kv.set(`result:${quizId}:${studentKey}`, result);
    await kv.lpush(`results_list:${quizId}`, studentKey);

    // Clean up session
    session.submitted = true;
    await kv.set(`session:${quizId}:${studentKey}`, session, { ex: 300 }); // keep briefly then expire
    await kv.del(`sidx:${sessionId}`);

    return res.status(200).json({
      success: true,
      score,
      total,
      percentage,
      answeredCount,
      autoSubmitted: autoSubmitted || false,
      timeTakenStr: msToMinSec(timeTakenMs),
    });
  } catch (err) {
    console.error('[/api/submit]', err);
    return res.status(500).json({ error: 'Server error during submission. Please contact your teacher.' });
  }
}
