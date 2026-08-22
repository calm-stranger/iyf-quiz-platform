const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

const enabled = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

function headers(extra = {}) {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...extra,
  };
}

function tableUrl(table, query = '') {
  const base = `${SUPABASE_URL}/rest/v1/${table}`;
  return query ? `${base}?${query}` : base;
}

async function request(table, query, options = {}) {
  if (!enabled) return null;

  const res = await fetch(tableUrl(table, query), {
    ...options,
    headers: headers(options.headers),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.message || data?.error || text || `Supabase ${res.status}`;
    throw new Error(message);
  }

  return data;
}

function toDbQuestion(q, quizId, position) {
  return {
    quiz_id: quizId,
    question: q.question,
    options: q.options,
    correct_index: q.correct,
    position,
  };
}

function fromDbQuestion(q) {
  return {
    id: q.id,
    question: q.question,
    options: q.options,
    correct: q.correct_index,
  };
}

/**
 * PostgREST filter for one "lane" — the set of quizzes that replace each other.
 *
 * A quiz with no event is a plain standalone quiz and shares one global slot,
 * exactly as before V2. A quiz with an event shares a slot only with quizzes of
 * the same event, group and stage, which is what lets Utkarsh run Group A, B
 * and C at the same time.
 */
function laneFilter({ event, groupCode, stage } = {}) {
  if (!event) return 'event=is.null';
  const parts = [`event=eq.${encodeURIComponent(event)}`];
  parts.push(groupCode ? `group_code=eq.${encodeURIComponent(groupCode)}` : 'group_code=is.null');
  parts.push(`stage=eq.${stage ?? 1}`);
  return parts.join('&');
}

/**
 * The active quiz, either for a lane or — with no selector — the single global
 * one. Passing a slug wins over the lane, for a direct link to a known quiz.
 */
async function getActiveQuiz(selector = {}) {
  const order = 'order=started_at.desc.nullslast,created_at.desc&limit=1';

  if (selector.slug) {
    const rows = await request(
      'quizzes',
      `slug=eq.${encodeURIComponent(selector.slug)}&status=eq.active&${order}`
    );
    return rows?.[0] || null;
  }

  const rows = await request('quizzes', `status=eq.active&${laneFilter(selector)}&${order}`);
  return rows?.[0] || null;
}

/** Any quiz with this slug, whatever its status — for admin and diagnostics. */
async function getQuizBySlug(slug) {
  if (!enabled || !slug) return null;
  const rows = await request('quizzes', `slug=eq.${encodeURIComponent(slug)}&limit=1`);
  return rows?.[0] || null;
}

async function getQuizQuestions(quizId) {
  const rows = await request(
    'questions',
    `quiz_id=eq.${quizId}&order=position.asc,created_at.asc`
  );
  return (rows || []).map(fromDbQuestion);
}

async function getActiveQuizWithQuestions(selector = {}) {
  if (!enabled) return null;
  const quiz = await getActiveQuiz(selector);
  if (!quiz) return null;
  const questions = await getQuizQuestions(quiz.id);
  return { quiz, questions };
}

async function listQuizzes() {
  if (!enabled) return [];
  const quizzes = await request('quizzes', 'order=created_at.desc');
  const attempts = await request('attempts', 'select=quiz_id,status,score,percentage');
  const questions = await request('questions', 'select=quiz_id');

  return (quizzes || []).map((quiz) => {
    const quizAttempts = (attempts || []).filter((a) => a.quiz_id === quiz.id);
    const submitted = quizAttempts.filter((a) => a.status === 'submitted');
    const avgScore = submitted.length
      ? Math.round(submitted.reduce((sum, a) => sum + (a.percentage || 0), 0) / submitted.length)
      : 0;

    return {
      ...quiz,
      questionCount: (questions || []).filter((q) => q.quiz_id === quiz.id).length,
      attemptCount: quizAttempts.length,
      submittedCount: submitted.length,
      avgScore,
    };
  });
}

async function createQuiz({ title, durationMinutes, maxStudents, event, groupCode, slug, stage }) {
  const rows = await request('quizzes', '', {
    method: 'POST',
    body: JSON.stringify({
      title,
      duration_minutes: durationMinutes,
      max_students: maxStudents,
      status: 'draft',
      // Omitted entirely when absent, so an ordinary quiz is created with the
      // same shape it always was.
      ...(event ? { event } : {}),
      ...(groupCode ? { group_code: groupCode } : {}),
      ...(slug ? { slug } : {}),
      ...(stage ? { stage } : {}),
    }),
  });
  return rows?.[0] || null;
}

/** Removes every question from a quiz. Used before a re-import. */
async function deleteQuizQuestions(quizId) {
  if (!enabled) return;
  await request('questions', `quiz_id=eq.${quizId}`, { method: 'DELETE' });
}

/**
 * Replaces a quiz's questions with the given set.
 *
 * Importing used to APPEND, so pressing the button twice silently doubled the
 * paper — and because the import target is the selected quiz while the dropdown
 * chooses the bank, it was easy to press it repeatedly against the wrong quiz
 * and end up with 75 questions in a 15-question round. Replacing makes a second
 * press a no-op instead of a mess.
 */
async function replaceQuestions(quizId, questions) {
  await deleteQuizQuestions(quizId);
  return importQuestions(quizId, questions);
}

async function importQuestions(quizId, questions) {
  if (!questions.length) return [];
  const rows = await request('questions', '', {
    method: 'POST',
    body: JSON.stringify(questions.map((q, i) => toDbQuestion(q, quizId, i + 1))),
  });
  return rows || [];
}

async function setQuizStatus(quizId, status) {
  const patch = { status };
  if (status === 'active') patch.started_at = new Date().toISOString();
  if (status === 'closed') patch.closed_at = new Date().toISOString();

  if (status === 'active') {
    /*
      Close the quizzes this one replaces, and only those.

      Before V2 this closed EVERY active quiz, which would mean publishing an
      ordinary quiz silently knocked all three Utkarsh group quizzes offline
      mid-exam. Scoped to the lane, a standalone quiz still has exactly one
      global slot (event is null) and the Utkarsh groups have one slot each.
    */
    const target = (await request('quizzes', `id=eq.${quizId}&limit=1`))?.[0];
    const filter = `status=eq.active&${laneFilter({
      event: target?.event,
      groupCode: target?.group_code,
      stage: target?.stage,
    })}`;

    await request('quizzes', filter, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'closed', closed_at: new Date().toISOString() }),
    });
  }

  const rows = await request('quizzes', `id=eq.${quizId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return rows?.[0] || null;
}

async function findAttempt(quizId, studentKey) {
  // Exclude reset attempts so a retaker always gets a fresh session.
  const rows = await request(
    'attempts',
    `quiz_id=eq.${quizId}&student_key=eq.${encodeURIComponent(studentKey)}&status=neq.reset&limit=1`
  );
  return rows?.[0] || null;
}

async function createAttempt({ quizId, studentName, studentKey, sessionId, email, dob, school }) {
  const rows = await request('attempts', 'on_conflict=quiz_id,student_key', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      quiz_id: quizId,
      student_name: studentName,
      student_key: studentKey,
      session_id: sessionId,
      email,
      dob,
      school,
      status: 'active',
      started_at: new Date().toISOString(),
      violations: 0,
      score: null,
      total: null,
      percentage: null,
      answered_count: null,
      time_taken_ms: null,
      submitted_at: null,
      auto_submitted: false,
    }),
  });
  return rows?.[0] || null;
}

async function getAttemptBySessionId(sessionId) {
  const rows = await request(
    'attempts',
    `session_id=eq.${encodeURIComponent(sessionId)}&limit=1`
  );
  return rows?.[0] || null;
}

async function updateAttemptSession(attemptId, sessionId) {
  const rows = await request('attempts', `id=eq.${attemptId}`, {
    method: 'PATCH',
    body: JSON.stringify({ session_id: sessionId }),
  });
  return rows?.[0] || null;
}

async function submitAttempt(attemptId, result, answers) {
  const rows = await request('attempts', `id=eq.${attemptId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      submitted_at: new Date(result.submittedAt).toISOString(),
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      answered_count: result.answeredCount,
      time_taken_ms: result.timeTakenMs,
      auto_submitted: result.autoSubmitted,
      violations: result.violations,
      status: 'submitted',
    }),
  });

  if (answers.length) {
    await request('answers', '', {
      method: 'POST',
      body: JSON.stringify(answers),
    });
  }

  return rows?.[0] || null;
}

async function listAttempts(quizId) {
  const query = quizId
    ? `quiz_id=eq.${quizId}&order=started_at.desc`
    : 'order=started_at.desc';
  return (await request('attempts', query)) || [];
}

async function resetAttempt(attemptId) {
  // Delete all recorded answers so they don't bleed into a retake.
  await request('answers', `attempt_id=eq.${attemptId}`, { method: 'DELETE' });
  // Mark the attempt as reset and clear all scoring fields.
  const rows = await request('attempts', `id=eq.${attemptId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'reset',
      score: null,
      total: null,
      percentage: null,
      answered_count: null,
      time_taken_ms: null,
      submitted_at: null,
      auto_submitted: false,
    }),
  });
  return rows?.[0] || null;
}

async function getWrongAnswers(attemptId) {
  if (!enabled) return [];

  // Fetch wrong answers for this attempt, also grab the attempt's student_key and quiz_id
  const attempts = await request('attempts', `id=eq.${attemptId}&select=id,student_key,quiz_id`);
  const attempt = attempts?.[0];
  if (!attempt) return [];

  const answers = await request('answers', `attempt_id=eq.${attemptId}&is_correct=eq.false`);
  if (!answers || !answers.length) return [];

  const questionIds = answers.map((a) => a.question_id);
  const questions = await request('questions', `id=in.(${questionIds.join(',')})&select=id,question,options,correct_index,position`);

  // Re-create the same shuffle used during the quiz so indices map correctly
  const { shuffleWithSeed } = require('./shuffle');
  const studentKey = attempt.student_key;

  return answers.map((a) => {
    const q = (questions || []).find((q) => q.id === a.question_id);
    if (!q) return null;

    // Reproduce the exact option order the student saw
    const optionIndices = [0, 1, 2, 3];
    // seed format from start.js: `${studentKey}-opts-${qIdx}` where qIdx = position - 1
    const qIdx = (q.position || 1) - 1;
    const shuffledOptionOrder = shuffleWithSeed(optionIndices, `${studentKey}-opts-${qIdx}`);

    // Build options in the shuffled order (as presented to the student)
    const shuffledOptions = shuffledOptionOrder.map((origIdx) =>
      Array.isArray(q.options) ? q.options[origIdx] : (q.options?.[origIdx] ?? '')
    );

    return {
      id: a.id,
      selectedIndex: a.selected_index,   // index into shuffledOptions
      correctIndex: a.correct_index,     // index into shuffledOptions
      isCorrect: a.is_correct,
      questionText: q.question,
      options: shuffledOptions,          // in the order the student saw them
    };
  }).filter(Boolean);
}


module.exports = {
  enabled,
  createAttempt,
  createQuiz,
  findAttempt,
  getActiveQuizWithQuestions,
  getAttemptBySessionId,
  getQuizBySlug,
  getWrongAnswers,
  importQuestions,
  replaceQuestions,
  deleteQuizQuestions,
  listAttempts,
  listQuizzes,
  resetAttempt,
  setQuizStatus,
  submitAttempt,
  updateAttemptSession,
};
