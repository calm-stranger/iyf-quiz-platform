const db = require('../../lib/db');

const FALLBACK_QUIZ_TITLE = 'Local Quiz';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let title = FALLBACK_QUIZ_TITLE;
    let isActive = true;
    // Reported so the instructions page can state the real numbers rather than
    // constants somebody has to remember to update.
    let questionCount = null;
    let durationMinutes = null;

    // ?slug=… asks about one specific quiz — a group's. Without it this is
    // the single globally active standalone quiz, as before.
    const slug = typeof req.query.slug === 'string' ? req.query.slug : '';

    if (db.enabled) {
      const active = await db.getActiveQuizWithQuestions(slug ? { slug } : {});
      if (active?.quiz?.title) {
        title = active.quiz.title;
        isActive = true;
        questionCount = active.questions?.length ?? null;
        durationMinutes = active.quiz.duration_minutes ?? null;
      } else {
        title = 'No Active Quiz';
        isActive = false;
      }
    }
    return res.status(200).json({ title, isActive, questionCount, durationMinutes });
  } catch (err) {
    console.error('[/api/active-quiz]', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
