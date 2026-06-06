/**
 * GET /api/admin?password=xxx
 *
 * Returns all submitted results for the admin dashboard.
 * Protected by ADMIN_PASSWORD env var (default: "admin123" — change this!).
 *
 * DELETE /api/admin?password=xxx&studentKey=xxx
 * Resets a single student so they can retake the quiz.
 */

const kv = require('../../lib/store');
const fallbackQuestions = require('../../lib/questions');
const db = require('../../lib/db');
const { getWrongAnswers } = db;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const LOCAL_QUIZ_ID = 'local';

export default async function handler(req, res) {
  const { password, studentKey, quizId = LOCAL_QUIZ_ID, attemptId } = req.query;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password.' });
  }

  if (req.method === 'POST') {
    if (!db.enabled) {
      return res.status(400).json({
        error: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.',
      });
    }

    try {
      const { action } = req.body ?? {};

      if (action === 'create_quiz') {
        const title = String(req.body.title || '').trim();
        const durationMinutes = parseInt(req.body.durationMinutes || '30', 10);
        const maxStudents = parseInt(req.body.maxStudents || '50', 10);
        if (!title) return res.status(400).json({ error: 'Quiz title is required.' });

        const quiz = await db.createQuiz({ title, durationMinutes, maxStudents });
        return res.status(200).json({ quiz });
      }

      if (action === 'import_current_questions') {
        if (!req.body.quizId) return res.status(400).json({ error: 'quizId is required.' });
        const questions = await db.importQuestions(req.body.quizId, fallbackQuestions);
        return res.status(200).json({ imported: questions.length });
      }

      if (action === 'set_status') {
        if (!req.body.quizId || !req.body.status) {
          return res.status(400).json({ error: 'quizId and status are required.' });
        }
        const quiz = await db.setQuizStatus(req.body.quizId, req.body.status);
        return res.status(200).json({ quiz });
      }

      return res.status(400).json({ error: 'Unknown admin action.' });
    } catch (err) {
      console.error('[/api/admin POST]', err);
      return res.status(500).json({ error: err.message || 'Server error.' });
    }
  }

  // ── DELETE: reset a student ──────────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!studentKey && !attemptId) {
      return res.status(400).json({ error: 'Missing studentKey or attemptId.' });
    }
    try {
      if (db.enabled && attemptId) {
        await db.resetAttempt(attemptId);
      }

      if (studentKey) {
        await kv.del(`result:${quizId}:${studentKey}`);
        await kv.del(`session:${quizId}:${studentKey}`);
      }

      // Rebuild results_list without this key
      const resultListKey = `results_list:${quizId}`;
      const allKeys = await kv.lrange(resultListKey, 0, -1);
      const filtered = allKeys.filter((k) => k !== studentKey);
      await kv.del(resultListKey);
      for (const k of filtered) await kv.lpush(resultListKey, k);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[/api/admin DELETE]', err);
      return res.status(500).json({ error: 'Server error.' });
    }
  }

  // ── GET: fetch all results ───────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      // Sub-action: get wrong answers for a specific attempt
      if (req.query.action === 'wrong_answers') {
        if (!attemptId) return res.status(400).json({ error: 'attemptId is required.' });
        if (!db.enabled) return res.status(400).json({ error: 'Supabase is not configured.' });
        const wrongAnswers = await getWrongAnswers(attemptId);
        return res.status(200).json({ wrongAnswers });
      }

      const quizzes = db.enabled ? await db.listQuizzes() : [localQuizSummary()];
      const selectedQuizId =
        quizId !== LOCAL_QUIZ_ID
          ? quizId
          : quizzes.find((q) => q.status === 'active')?.id || quizzes[0]?.id || '';

      const results = db.enabled
        ? selectedQuizId
          ? mapDbAttempts(await db.listAttempts(selectedQuizId), quizzes)
          : []
        : await getLocalResults(selectedQuizId);

      // Also count active (not-yet-submitted) sessions
      const sessionKeys = await kv.keys('session:*');
      const activeSessions = [];
      for (const sk of sessionKeys) {
        const s = await kv.get(sk);
        if (s && !s.submitted && (!selectedQuizId || s.quizId === selectedQuizId)) {
          activeSessions.push({
            studentName: s.studentName,
            startTime: s.startTime,
            violations: s.violations || 0,
            quizTitle: s.quizTitle,
          });
        }
      }

      const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0] || null;
      const studentCount = db.enabled
        ? results.length + activeSessions.length
        : (await kv.get(`student_count:${selectedQuizId}`)) || 0;

      return res.status(200).json({
        dbEnabled: db.enabled,
        quizzes,
        selectedQuizId,
        selectedQuiz,
        results,
        activeSessions,
        studentCount,
        maxStudents: selectedQuiz?.max_students || parseInt(process.env.MAX_STUDENTS || '50', 10),
      });
    } catch (err) {
      console.error('[/api/admin GET]', err);
      return res.status(500).json({ error: 'Server error.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}

function localQuizSummary() {
  return {
    id: LOCAL_QUIZ_ID,
    title: 'Local Quiz',
    duration_minutes: parseInt(process.env.QUIZ_DURATION_MINUTES || '30', 10),
    max_students: parseInt(process.env.MAX_STUDENTS || '50', 10),
    status: 'active',
    questionCount: fallbackQuestions.length,
    attemptCount: 0,
    submittedCount: 0,
    avgScore: 0,
  };
}

async function getLocalResults(quizId) {
  const resultKeys = await kv.lrange(`results_list:${quizId}`, 0, -1);
  return (
    await Promise.all(
      resultKeys.map(async (key) => {
        const r = await kv.get(`result:${quizId}:${key}`);
        return r || null;
      })
    )
  ).filter(Boolean);
}

function mapDbAttempts(attempts, quizzes) {
  return attempts
    .filter((a) => a.status === 'submitted')
    .map((a) => {
      const quiz = quizzes.find((q) => q.id === a.quiz_id);
      return {
        attemptId: a.id,
        quizId: a.quiz_id,
        quizTitle: quiz?.title || 'Quiz',
        studentName: a.student_name,
        email: a.email || '',
        dob: a.dob || '',
        studentKey: a.student_key,
        score: a.score || 0,
        total: a.total || 0,
        percentage: a.percentage || 0,
        answeredCount: a.answered_count || 0,
        timeTakenMs: a.time_taken_ms || 0,
        timeTakenStr: msToMinSec(a.time_taken_ms || 0),
        autoSubmitted: a.auto_submitted,
        violations: a.violations || 0,
        submittedAt: a.submitted_at ? new Date(a.submitted_at).getTime() : Date.now(),
      };
    });
}

function msToMinSec(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}m ${s}s`;
}
