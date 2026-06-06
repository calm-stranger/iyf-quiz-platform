const db = require('../../lib/db');

const FALLBACK_QUIZ_TITLE = 'Local Quiz';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let title = FALLBACK_QUIZ_TITLE;
    let isActive = true;
    if (db.enabled) {
      const active = await db.getActiveQuizWithQuestions();
      if (active?.quiz?.title) {
        title = active.quiz.title;
        isActive = true;
      } else {
        title = 'No Active Quiz';
        isActive = false;
      }
    }
    return res.status(200).json({ title, isActive });
  } catch (err) {
    console.error('[/api/active-quiz]', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
