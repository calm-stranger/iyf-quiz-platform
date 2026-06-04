/**
 * POST /api/violation
 * Body: { sessionId: string }
 *
 * Increments the violation counter for the session.
 * Returns { action: 'warn' } on the first violation.
 * Returns { action: 'submit' } on the second — the client should auto-submit.
 *
 * Tracking violations server-side means refreshing the page won't reset them.
 */

const kv = require('../../lib/store');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.body ?? {};

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  try {
    // Look up student key via the session index
    const sessionIndex = await kv.get(`sidx:${sessionId}`);
    if (!sessionIndex) {
      // Session expired or never existed — tell client to submit
      return res.status(200).json({ action: 'submit', reason: 'session_not_found' });
    }

    const { quizId, studentKey } =
      typeof sessionIndex === 'string'
        ? { quizId: 'local', studentKey: sessionIndex }
        : sessionIndex;

    const session = await kv.get(`session:${quizId}:${studentKey}`) || await kv.get(`session:${studentKey}`);
    if (!session) {
      return res.status(200).json({ action: 'submit', reason: 'session_not_found' });
    }

    if (session.submitted) {
      return res.status(200).json({ action: 'submit', reason: 'already_submitted' });
    }

    // Increment violation count
    session.violations = (session.violations || 0) + 1;
    await kv.set(`session:${quizId}:${studentKey}`, session, { ex: 7200 });

    if (session.violations >= 2) {
      return res.status(200).json({ action: 'submit', violations: session.violations });
    }

    return res.status(200).json({ action: 'warn', violations: session.violations });
  } catch (err) {
    console.error('[/api/violation]', err);
    // On error, fail safe: tell client to show warning rather than auto-submit
    return res.status(200).json({ action: 'warn', reason: 'server_error' });
  }
}
