import { useState, useRef } from 'react';
import Head from 'next/head';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(null);
  const [tab, setTab] = useState('submitted'); // 'submitted' | 'active'
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [wrongAnswersModal, setWrongAnswersModal] = useState(null); // { studentName, answers, loading }
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    durationMinutes: '30',
    maxStudents: '50',
  });
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }
  const toastTimerRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, confirmLabel, danger, onConfirm }

  const showToast = (message, type = 'error') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  // A native confirm()/alert() can't be styled and reads as a jarring OS
  // dialog, especially on mobile. This is the one in-app replacement used
  // everywhere a destructive or data-changing action needs a yes/no first.
  const askConfirm = ({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm }) => {
    setConfirmDialog({ title, message, confirmLabel, danger, onConfirm });
  };
  const closeConfirm = () => setConfirmDialog(null);
  const runConfirm = async () => {
    const dlg = confirmDialog;
    setConfirmDialog(null);
    if (dlg?.onConfirm) await dlg.onConfirm();
  };

  const fetchData = async (pwd = password, quizId = selectedQuizId) => {
    // The list of importable banks never changes at runtime; fetched here so
    // it is available as soon as the admin is signed in.
    fetch(`/api/admin?action=banks&password=${encodeURIComponent(pwd)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.banks && setBanks(j.banks))
      .catch(() => {});

    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({ password: pwd });
      if (quizId) qs.set('quizId', quizId);
      const res = await fetch(`/api/admin?${qs.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Access denied.');
        setData(null);
      } else {
        setData(json);
        setSelectedQuizId(json.selectedQuizId || '');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchData(password);
  };

  const handleReset = (studentKey, studentName, attemptId) => {
    askConfirm({
      title: 'Reset student',
      message: `Reset ${studentName}? They will be able to retake the quiz.`,
      confirmLabel: 'Reset',
      danger: true,
      onConfirm: async () => {
        setResetting(studentKey);
        try {
          const qs = new URLSearchParams({ password, quizId: selectedQuizId });
          if (studentKey) qs.set('studentKey', studentKey);
          if (attemptId) qs.set('attemptId', attemptId);
          const res = await fetch(`/api/admin?${qs.toString()}`, { method: 'DELETE' });
          const json = await res.json();
          if (res.ok) {
            await fetchData();
            showToast(`${studentName} was reset.`, 'success');
          } else {
            showToast(json.error || 'Reset failed.');
          }
        } catch {
          showToast('Network error.');
        }
        setResetting(null);
      },
    });
  };

  const fetchWrongAnswers = async (attemptId, studentName) => {
    setWrongAnswersModal({ studentName, answers: [], loading: true });
    try {
      const qs = new URLSearchParams({ password, action: 'wrong_answers', attemptId });
      const res = await fetch(`/api/admin?${qs.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setWrongAnswersModal({ studentName, answers: json.wrongAnswers || [], loading: false });
      } else {
        setWrongAnswersModal({ studentName, answers: [], loading: false, error: json.error || 'Failed to load.' });
      }
    } catch {
      setWrongAnswersModal({ studentName, answers: [], loading: false, error: 'Network error.' });
    }
  };

  const adminAction = async (payload, successMessage) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?password=${encodeURIComponent(password)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || 'Action failed.');
      } else {
        await fetchData(password, payload.quizId || json.quiz?.id || selectedQuizId);
        if (successMessage) showToast(successMessage, 'success');
      }
    } catch {
      showToast('Network error. Please try again.');
    }
    setLoading(false);
  };

  const setupUtkarsh = () => {
    askConfirm({
      title: 'Set up Utkarsh 2026',
      message: 'Create the three Utkarsh group quizzes as drafts? Existing ones are left alone.',
      confirmLabel: 'Create quizzes',
      onConfirm: () => adminAction({ action: 'setup_utkarsh' }, 'Utkarsh group quizzes created.'),
    });
  };

  const createQuiz = async (e) => {
    e.preventDefault();
    const title = newQuiz.title.trim();
    await adminAction(
      {
        action: 'create_quiz',
        title: newQuiz.title,
        durationMinutes: newQuiz.durationMinutes,
        maxStudents: newQuiz.maxStudents,
      },
      title ? `"${title}" created.` : 'Quiz created.'
    );
    setNewQuiz({ title: '', durationMinutes: '30', maxStudents: '50' });
  };

  const exportCSV = () => {
    if (!data?.results?.length) return;
    const header = 'Name,Email,DOB,Score,Total,Percentage,Answered,Time Taken,Auto-Submitted,Violations,Submitted At';
    const rows = data.results.map((r) =>
      [
        `"${r.studentName}"`,
        `"${r.email || ''}"`,
        `"${r.dob || ''}"`,
        r.score,
        r.total,
        `${r.percentage}%`,
        r.answeredCount,
        r.timeTakenStr,
        r.autoSubmitted ? 'YES' : 'No',
        r.violations,
        new Date(r.submittedAt).toLocaleString(),
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${selectedQuizId || 'quiz'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Not logged in yet ──────────────────────────────────────────────────────
  if (!data) {
    return (
      <>
        <Head>
          <title>Admin — Quiz Platform</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 bg-[#18181B] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>

            <h1 className="text-xl font-semibold text-[#18181B] text-center mb-1">Admin Panel</h1>
            <p className="text-sm text-[#71717A] text-center mb-8">Enter your admin password</p>

            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#18181B] text-sm mb-3"
                style={{ userSelect: 'text' }}
              />
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#18181B] text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50 hover:bg-[#27272A] transition-colors"
              >
                {loading ? 'Loading…' : 'View Results →'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  const {
    results,
    activeSessions,
    studentCount,
    maxStudents,
    quizzes = [],
    selectedQuiz,
    dbEnabled,
  } = data;
  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
      : 0;
  const autoSubmittedCount = results.filter((r) => r.autoSubmitted).length;

  return (
    <>
      <Head>
        <title>Admin — Quiz Results</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#F7F6F3]">
        {/* Header */}
        <div className="bg-white border-b border-[#E4E4E7] sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="font-semibold text-[#18181B]">Quiz Admin</h1>
              <p className="text-xs text-[#71717A] truncate">
                {selectedQuiz?.title || 'Quiz'} · {studentCount}/{maxStudents} students registered
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => fetchData()}
                className="px-3 py-2 sm:py-1.5 text-xs border border-[#D4D4D8] rounded-lg text-[#52525B] hover:bg-[#F4F4F5] transition-colors"
              >
                ↻ Refresh
              </button>
              <button
                onClick={exportCSV}
                disabled={!results.length}
                className="px-3 py-2 sm:py-1.5 text-xs bg-[#18181B] text-white rounded-lg disabled:opacity-40 hover:bg-[#27272A] transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
          {!dbEnabled && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">
              Supabase is not configured yet. The app is still using local questions and temporary results.
            </div>
          )}

          {dbEnabled && (
            <div className="grid md:grid-cols-[1fr_360px] gap-4 mb-6">
              <div className="bg-white rounded-xl border border-[#E4E4E7] p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between mb-4">
                  <div>
                    <p className="text-xs text-[#A1A1AA] uppercase tracking-widest">Quiz Library</p>
                    <h2 className="font-semibold text-[#18181B] mt-1">All quizzes</h2>
                  </div>
                  <select
                    value={selectedQuizId}
                    onChange={(e) => fetchData(password, e.target.value)}
                    disabled={!quizzes.length}
                    className="px-3 py-2 rounded-lg border border-[#D4D4D8] bg-white text-sm"
                  >
                    {!quizzes.length && <option value="">No quizzes yet</option>}
                    {quizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title} ({q.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {!quizzes.length && (
                    <div className="border border-dashed border-[#D4D4D8] rounded-xl p-4 text-sm text-[#71717A]">
                      Create your first quiz using the form on the right.
                    </div>
                  )}
                  {quizzes.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => fetchData(password, q.id)}
                      className={`text-left border rounded-xl p-3 transition-colors ${
                        selectedQuizId === q.id
                          ? 'border-[#18181B] bg-[#FAFAF9]'
                          : 'border-[#E4E4E7] hover:border-[#A1A1AA]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm text-[#18181B]">{q.title}</p>
                        <span className="text-[10px] uppercase tracking-wider text-[#71717A]">{q.status}</span>
                      </div>
                      {/* Three Utkarsh quizzes are live at once and their
                          titles are near-identical, so the lane is shown. */}
                      {q.event ? (
                        <p className="mt-1 inline-block rounded bg-[#EEF1FA] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1B3A9C]">
                          {q.event}{q.group_code ? ` · group ${q.group_code}` : ''}
                          {q.stage && q.stage > 1 ? ` · stage ${q.stage}` : ''}
                        </p>
                      ) : null}
                      <p className="text-xs text-[#71717A] mt-2">
                        {q.questionCount || 0} questions · {q.submittedCount || 0} submitted · avg {q.avgScore || 0}%
                      </p>
                    </button>
                  ))}
                </div>

                {selectedQuiz && (
                  <div className="mt-4 pt-4 border-t border-[#F4F4F5]">
                    <p className="mb-3 text-xs text-[#71717A]">
                      Acting on <span className="font-medium text-[#18181B]">{selectedQuiz.title}</span>
                      {' — '}{selectedQuiz.questionCount || 0} question(s)
                    </p>

                    <div className="space-y-3">
                      {/* Questions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="px-2 py-2.5 sm:py-2 text-xs border border-[#D4D4D8] rounded-lg bg-white flex-1 sm:flex-none sm:min-w-[220px]"
                        >
                          <option value="">Choose a question bank…</option>
                          {banks.map((b) => (
                            <option key={b.key} value={b.key}>
                              {b.label} ({b.count})
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const bank = banks.find((x) => x.key === selectedBank);
                              // Name BOTH sides. The bank comes from the dropdown
                              // and the target from the selected card, and mixing
                              // the two up is what puts a Round 1 bank into a
                              // Round 2 quiz.
                              askConfirm({
                                title: 'Import questions',
                                message: `Import "${bank?.label ?? selectedBank}" (${bank?.count ?? '?'} questions) into "${selectedQuiz.title}"? This replaces the ${selectedQuiz.questionCount || 0} question(s) currently in that quiz.`,
                                confirmLabel: 'Import',
                                danger: selectedQuiz.questionCount > 0,
                                onConfirm: () =>
                                  adminAction(
                                    { action: 'import_bank', quizId: selectedQuiz.id, bank: selectedBank },
                                    `Imported ${bank?.count ?? ''} question(s).`
                                  ),
                              });
                            }}
                            disabled={loading || !selectedBank}
                            className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 text-xs border border-[#D4D4D8] rounded-lg hover:bg-[#F4F4F5] disabled:opacity-40"
                          >
                            Import
                          </button>
                          {selectedQuiz.questionCount > 0 ? (
                            <button
                              onClick={() =>
                                askConfirm({
                                  title: 'Clear questions',
                                  message: `Remove all ${selectedQuiz.questionCount} questions from "${selectedQuiz.title}"? This cannot be undone.`,
                                  confirmLabel: 'Clear questions',
                                  danger: true,
                                  onConfirm: () =>
                                    adminAction({ action: 'clear_questions', quizId: selectedQuiz.id }, 'Questions cleared.'),
                                })
                              }
                              disabled={loading}
                              className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 text-xs border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-40"
                            >
                              Clear
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {/* Lifecycle + settings */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            adminAction(
                              { action: 'set_status', quizId: selectedQuiz.id, status: 'active' },
                              `${selectedQuiz.title} published.`
                            )
                          }
                          disabled={loading}
                          className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 text-xs bg-emerald-600 text-white rounded-lg disabled:opacity-40"
                        >
                          Publish
                        </button>
                        <button
                          onClick={() =>
                            adminAction(
                              { action: 'set_status', quizId: selectedQuiz.id, status: 'closed' },
                              `${selectedQuiz.title} closed.`
                            )
                          }
                          disabled={loading}
                          className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 text-xs bg-[#18181B] text-white rounded-lg disabled:opacity-40"
                        >
                          Close
                        </button>
                        <button
                          onClick={() =>
                            adminAction(
                              {
                                action: 'set_show_results',
                                quizId: selectedQuiz.id,
                                showResults: !selectedQuiz.show_results,
                              },
                              selectedQuiz.show_results
                                ? 'Students will no longer see their results.'
                                : 'Students will now see their results after submitting.'
                            )
                          }
                          disabled={loading}
                          title="When on, students see their score and a correct/incorrect answer review right after they submit."
                          className={`flex-1 sm:flex-none px-3 py-2.5 sm:py-2 text-xs rounded-lg border disabled:opacity-40 ${
                            selectedQuiz.show_results
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-[#D4D4D8] text-[#52525B] hover:bg-[#F4F4F5]'
                          }`}
                        >
                          {selectedQuiz.show_results ? '✓ Students see results' : 'Students see results: off'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* One button instead of typing three titles, three slugs and
                  three group codes correctly on the morning of the event. */}
              <div className="bg-white rounded-xl border border-[#E4E4E7] p-4">
                <p className="text-sm font-medium text-[#18181B]">Utkarsh 2026</p>
                <p className="mt-1 text-xs leading-relaxed text-[#71717A]">
                  Creates the three group quizzes as drafts. Import a bank into each, then
                  publish them — all three can be live at once.
                </p>
                <button
                  onClick={setupUtkarsh}
                  disabled={loading}
                  className="mt-3 px-3 py-2 text-xs bg-[#1B3A9C] text-white rounded-lg disabled:opacity-40"
                >
                  Set up the three group quizzes
                </button>
              </div>

              <form onSubmit={createQuiz} className="bg-white rounded-xl border border-[#E4E4E7] p-4">
                <p className="text-xs text-[#A1A1AA] uppercase tracking-widest">New Quiz</p>
                <div className="space-y-3 mt-3">
                  <input
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz((q) => ({ ...q, title: e.target.value }))}
                    placeholder="Quiz title"
                    className="w-full px-3 py-2 rounded-lg border border-[#D4D4D8] text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={newQuiz.durationMinutes}
                      onChange={(e) => setNewQuiz((q) => ({ ...q, durationMinutes: e.target.value }))}
                      placeholder="Minutes"
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-[#D4D4D8] text-sm"
                    />
                    <input
                      value={newQuiz.maxStudents}
                      onChange={(e) => setNewQuiz((q) => ({ ...q, maxStudents: e.target.value }))}
                      placeholder="Max students"
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-[#D4D4D8] text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !newQuiz.title.trim()}
                    className="w-full bg-[#18181B] text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-40"
                  >
                    Create Quiz
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Submitted', value: results.length, sub: `of ${studentCount} started` },
              { label: 'Active Now', value: activeSessions.length, sub: 'in progress' },
              { label: 'Avg Score', value: `${avgScore}%`, sub: `${results.length} submissions` },
              { label: 'Auto-submitted', value: autoSubmittedCount, sub: 'due to violations', warn: autoSubmittedCount > 0 },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-[#E4E4E7] px-4 py-3">
                <p className="text-xs text-[#A1A1AA] mb-1">{card.label}</p>
                <p className={`text-2xl font-semibold ${card.warn ? 'text-amber-600' : 'text-[#18181B]'}`}>
                  {card.value}
                </p>
                <p className="text-xs text-[#A1A1AA] mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#F4F4F5] rounded-xl p-1 mb-4 w-fit">
            {['submitted', 'active'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  tab === t ? 'bg-white text-[#18181B] shadow-sm' : 'text-[#71717A] hover:text-[#52525B]'
                }`}
              >
                {t === 'submitted' ? `Submitted (${results.length})` : `Active (${activeSessions.length})`}
              </button>
            ))}
          </div>

          {/* ── Submitted results table ──────────────────────────────────── */}
          {tab === 'submitted' && (
            <div className="bg-white rounded-2xl border border-[#E4E4E7] overflow-hidden">
              {results.length === 0 ? (
                <div className="text-center py-16 text-[#A1A1AA] text-sm">
                  <p className="text-3xl mb-2">📭</p>
                  No submissions yet
                </div>
              ) : (
                <>
                {/* Card list — phones only. The 12-column table below is unreadable
                    without horizontal scrolling below the sm breakpoint. */}
                <div className="sm:hidden divide-y divide-[#F4F4F5]">
                  {results.map((r, i) => (
                    <div key={r.studentKey || i} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-[#18181B] text-sm truncate">{r.studentName}</p>
                          {(r.email || r.dob) && (
                            <p className="text-xs text-[#A1A1AA] truncate">
                              {[r.email, r.dob].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                        <span
                          className={`flex-shrink-0 text-base font-semibold ${
                            r.percentage >= 70
                              ? 'text-emerald-600'
                              : r.percentage >= 40
                              ? 'text-amber-600'
                              : 'text-red-600'
                          }`}
                        >
                          {r.percentage}%
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#52525B]">
                        <span>{r.score}/{r.total} correct</span>
                        <span>{r.answeredCount}/{r.total} answered</span>
                        <span className="font-mono">{r.timeTakenStr}</span>
                        <span className="font-mono text-[#A1A1AA]">{new Date(r.submittedAt).toLocaleTimeString()}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {r.autoSubmitted ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full font-medium">
                            ⚠ Auto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-full font-medium">
                            ✓ Manual
                          </span>
                        )}
                        {r.violations > 0 && (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded-full font-medium">
                            {r.violations} violation{r.violations !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-4">
                        <button
                          onClick={() => fetchWrongAnswers(r.attemptId, r.studentName)}
                          className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                        >
                          View Answers
                        </button>
                        <button
                          onClick={() => handleReset(r.studentKey, r.studentName, r.attemptId)}
                          disabled={resetting === r.studentKey}
                          className="text-xs text-[#A1A1AA] hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {resetting === r.studentKey ? 'Resetting…' : 'Reset'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#F4F4F5]">
                        {['#', 'Student', 'Email', 'DOB', 'Score', '%', 'Answered', 'Time', 'Status', 'Violations', 'Submitted At', ''].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F4F5]">
                      {results.map((r, i) => (
                        <tr key={r.studentKey || i} className="hover:bg-[#FAFAF9]">
                          <td className="px-4 py-3 text-[#A1A1AA]">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-[#18181B]">{r.studentName}</td>
                          <td className="px-4 py-3 text-[#52525B] text-xs">{r.email || '-'}</td>
                          <td className="px-4 py-3 text-[#52525B] text-xs">{r.dob || '-'}</td>
                          <td className="px-4 py-3 text-[#18181B]">
                            {r.score} / {r.total}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-semibold ${
                                r.percentage >= 70
                                  ? 'text-emerald-600'
                                  : r.percentage >= 40
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {r.percentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#52525B]">
                            {r.answeredCount}/{r.total}
                          </td>
                          <td className="px-4 py-3 text-[#52525B] font-mono text-xs">
                            {r.timeTakenStr}
                          </td>
                          <td className="px-4 py-3">
                            {r.autoSubmitted ? (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full font-medium">
                                ⚠ Auto
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-full font-medium">
                                ✓ Manual
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {r.violations > 0 ? (
                              <span className="text-red-600 font-semibold">{r.violations}</span>
                            ) : (
                              <span className="text-[#A1A1AA]">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-[#A1A1AA]">
                            {new Date(r.submittedAt).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => fetchWrongAnswers(r.attemptId, r.studentName)}
                                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                                title="View questions answered incorrectly"
                              >
                                View Answers
                              </button>
                              <span className="text-[#D4D4D8]">|</span>
                              <button
                                onClick={() => handleReset(r.studentKey, r.studentName, r.attemptId)}
                                disabled={resetting === r.studentKey}
                                className="text-xs text-[#A1A1AA] hover:text-red-600 transition-colors disabled:opacity-50"
                                title="Reset student (allow retake)"
                              >
                                {resetting === r.studentKey ? '…' : 'Reset'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>
          )}

          {/* ── Active sessions table ────────────────────────────────────── */}
          {tab === 'active' && (
            <div className="bg-white rounded-2xl border border-[#E4E4E7] overflow-hidden">
              {activeSessions.length === 0 ? (
                <div className="text-center py-16 text-[#A1A1AA] text-sm">
                  <p className="text-3xl mb-2">💤</p>
                  No active sessions right now
                </div>
              ) : (
                <>
                <div className="sm:hidden divide-y divide-[#F4F4F5]">
                  {activeSessions.map((s, i) => (
                    <div key={i} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[#18181B] text-sm truncate">{s.studentName}</p>
                        <p className="text-xs text-[#A1A1AA] font-mono">
                          {new Date(s.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                      {s.violations > 0 ? (
                        <span className="flex-shrink-0 text-red-600 font-semibold text-sm">{s.violations} viol.</span>
                      ) : (
                        <span className="flex-shrink-0 text-[#A1A1AA] text-sm">0 viol.</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#F4F4F5]">
                        {['Student', 'Started At', 'Violations'].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F4F5]">
                      {activeSessions.map((s, i) => (
                        <tr key={i} className="hover:bg-[#FAFAF9]">
                          <td className="px-4 py-3 font-medium text-[#18181B]">{s.studentName}</td>
                          <td className="px-4 py-3 text-[#52525B] text-xs font-mono">
                            {new Date(s.startTime).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3">
                            {s.violations > 0 ? (
                              <span className="text-red-600 font-semibold">{s.violations}</span>
                            ) : (
                              <span className="text-[#A1A1AA]">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Wrong Answers Modal ────────────────────────────────────────── */}
      {wrongAnswersModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setWrongAnswersModal(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[#F4F4F5] flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold text-[#18181B]">
                  {wrongAnswersModal.studentName}
                </h2>
                <p className="text-xs text-[#71717A] mt-0.5">
                  {wrongAnswersModal.loading
                    ? 'Loading…'
                    : wrongAnswersModal.error
                    ? 'Error loading answers'
                    : wrongAnswersModal.answers.length === 0
                    ? 'No wrong answers — perfect score! 🎉'
                    : `${wrongAnswersModal.answers.length} question${wrongAnswersModal.answers.length !== 1 ? 's' : ''} answered incorrectly`
                  }
                </p>
              </div>
              <button
                onClick={() => setWrongAnswersModal(null)}
                className="text-[#A1A1AA] hover:text-[#18181B] transition-colors mt-0.5"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 space-y-4">
              {wrongAnswersModal.loading && (
                <div className="flex items-center justify-center py-12 text-[#A1A1AA] text-sm">
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading answers…
                </div>
              )}

              {!wrongAnswersModal.loading && wrongAnswersModal.error && (
                <div className="text-center py-12 text-red-500 text-sm">{wrongAnswersModal.error}</div>
              )}

              {!wrongAnswersModal.loading && !wrongAnswersModal.error && wrongAnswersModal.answers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🏆</p>
                  <p className="text-[#18181B] font-medium">Perfect score!</p>
                  <p className="text-sm text-[#71717A] mt-1">This student got every question correct.</p>
                </div>
              )}

              {!wrongAnswersModal.loading && wrongAnswersModal.answers.map((item, idx) => (
                <div key={item.id || idx} className="rounded-xl border border-[#E4E4E7] overflow-hidden">
                  {/* Question */}
                  <div className="bg-[#FAFAF9] px-4 py-3 border-b border-[#F4F4F5]">
                    <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest">Q{idx + 1}</span>
                    <p className="text-sm font-medium text-[#18181B] mt-0.5 leading-snug">{item.questionText}</p>
                  </div>
                  {/* Options */}
                  <div className="px-4 py-3 space-y-2">
                    {(Array.isArray(item.options) ? item.options : []).map((opt, optIdx) => {
                      const isSelected = optIdx === item.selectedIndex;
                      const isCorrect = optIdx === item.correctIndex;
                      let rowStyle = 'border border-[#E4E4E7] text-[#52525B]';
                      let badge = null;
                      if (isCorrect) {
                        rowStyle = 'border border-emerald-300 bg-emerald-50 text-emerald-800';
                        badge = <span className="sm:ml-auto text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full flex-shrink-0">Correct</span>;
                      } else if (isSelected) {
                        rowStyle = 'border border-red-300 bg-red-50 text-red-700';
                        badge = <span className="sm:ml-auto text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full flex-shrink-0">Student's answer</span>;
                      }
                      return (
                        <div key={optIdx} className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-3 py-2 text-sm ${rowStyle}`}>
                          <span className="font-mono text-xs w-4 flex-shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                          <span className="flex-1">{typeof opt === 'string' ? opt : JSON.stringify(opt)}</span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-[#F4F4F5] flex justify-end flex-shrink-0">
              <button
                onClick={() => setWrongAnswersModal(null)}
                className="px-4 py-2 bg-[#18181B] text-white text-sm rounded-lg hover:bg-[#27272A] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm dialog — replaces window.confirm() for every destructive
          or data-changing action so it can be styled and read well on a
          phone instead of popping a native OS dialog. ────────────────── */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeConfirm(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="text-base font-semibold text-[#18181B]">{confirmDialog.title}</h3>
            <p className="mt-2 text-sm text-[#52525B] leading-relaxed">{confirmDialog.message}</p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={closeConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#D4D4D8] text-sm font-medium text-[#3F3F46] hover:bg-[#F4F4F5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={runConfirm}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${
                  confirmDialog.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#18181B] hover:bg-[#27272A]'
                }`}
              >
                {confirmDialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast — success/error feedback for admin actions. Replaces
          window.alert() and a dashboard `error` state that was previously
          set but never rendered anywhere, so action failures failed
          silently. ──────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80] w-full max-w-sm px-4">
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === 'success'
                ? 'bg-emerald-600 border-emerald-700 text-white'
                : 'bg-red-600 border-red-700 text-white'
            }`}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="flex-shrink-0 text-white/80 hover:text-white"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
