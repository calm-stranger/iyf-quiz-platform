const db = require('../../lib/db');

const FALLBACK_QUIZ_TITLE = 'Local Quiz';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let title = FALLBACK_QUIZ_TITLE;
    if (db.enabled) {
      const active = await db.getActiveQuizWithQuestions();
      if (active?.quiz?.title) {
        title = active.quiz.title;
      } else {
        title = 'No Active Quiz';
      }
    }
    return res.status(200).json({ title });
  } catch (err) {
    console.error('[/api/active-quiz]', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
