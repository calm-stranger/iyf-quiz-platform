import { useState } from 'react';
import Head from 'next/head';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(null);
  const [tab, setTab] = useState('submitted'); // 'submitted' | 'active'
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    durationMinutes: '30',
    maxStudents: '50',
  });

  const fetchData = async (pwd = password, quizId = selectedQuizId) => {
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

  const handleReset = async (studentKey, studentName, attemptId) => {
    if (!confirm(`Reset ${studentName}? They will be able to retake the quiz.`)) return;
    setResetting(studentKey);
    try {
      const qs = new URLSearchParams({ password, quizId: selectedQuizId });
      if (studentKey) qs.set('studentKey', studentKey);
      if (attemptId) qs.set('attemptId', attemptId);
      const res = await fetch(`/api/admin?${qs.toString()}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok) {
        await fetchData();
      } else {
        alert(json.error || 'Reset failed.');
      }
    } catch {
      alert('Network error.');
    }
    setResetting(null);
  };

  const adminAction = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin?password=${encodeURIComponent(password)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Action failed.');
      } else {
        await fetchData(password, payload.quizId || json.quiz?.id || selectedQuizId);
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const createQuiz = async (e) => {
    e.preventDefault();
    await adminAction({
      action: 'create_quiz',
      title: newQuiz.title,
      durationMinutes: newQuiz.durationMinutes,
      maxStudents: newQuiz.maxStudents,
    });
    setNewQuiz({ title: '', durationMinutes: '30', maxStudents: '50' });
  };

  const exportCSV = () => {
    if (!data?.results?.length) return;
    const header = 'Name,Score,Total,Percentage,Answered,Time Taken,Auto-Submitted,Violations,Submitted At';
    const rows = data.results.map((r) =>
      [
        `"${r.studentName}"`,
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
      </Head>

      <div className="min-h-screen bg-[#F7F6F3]">
        {/* Header */}
        <div className="bg-white border-b border-[#E4E4E7] sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-[#18181B]">Quiz Admin</h1>
              <p className="text-xs text-[#71717A]">
                {selectedQuiz?.title || 'Quiz'} · {studentCount}/{maxStudents} students registered
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                className="px-3 py-1.5 text-xs border border-[#D4D4D8] rounded-lg text-[#52525B] hover:bg-[#F4F4F5] transition-colors"
              >
                ↻ Refresh
              </button>
              <button
                onClick={exportCSV}
                disabled={!results.length}
                className="px-3 py-1.5 text-xs bg-[#18181B] text-white rounded-lg disabled:opacity-40 hover:bg-[#27272A] transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
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
                      <p className="text-xs text-[#71717A] mt-2">
                        {q.questionCount || 0} questions · {q.submittedCount || 0} submitted · avg {q.avgScore || 0}%
                      </p>
                    </button>
                  ))}
                </div>

                {selectedQuiz && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#F4F4F5]">
                    <button
                      onClick={() => adminAction({ action: 'import_current_questions', quizId: selectedQuiz.id })}
                      disabled={loading}
                      className="px-3 py-2 text-xs border border-[#D4D4D8] rounded-lg hover:bg-[#F4F4F5]"
                    >
                      Import questions.js
                    </button>
                    <button
                      onClick={() => adminAction({ action: 'set_status', quizId: selectedQuiz.id, status: 'active' })}
                      disabled={loading}
                      className="px-3 py-2 text-xs bg-emerald-600 text-white rounded-lg disabled:opacity-40"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => adminAction({ action: 'set_status', quizId: selectedQuiz.id, status: 'closed' })}
                      disabled={loading}
                      className="px-3 py-2 text-xs bg-[#18181B] text-white rounded-lg disabled:opacity-40"
                    >
                      Close
                    </button>
                  </div>
                )}
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
                  No submissions yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#F4F4F5]">
                        {['#', 'Student', 'Score', '%', 'Answered', 'Time', 'Status', 'Violations', 'Submitted At', ''].map((h) => (
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
                            <button
                              onClick={() => handleReset(r.studentKey, r.studentName, r.attemptId)}
                              disabled={resetting === r.studentKey}
                              className="text-xs text-[#A1A1AA] hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Reset student (allow retake)"
                            >
                              {resetting === r.studentKey ? '…' : 'Reset'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Active sessions table ────────────────────────────────────── */}
          {tab === 'active' && (
            <div className="bg-white rounded-2xl border border-[#E4E4E7] overflow-hidden">
              {activeSessions.length === 0 ? (
                <div className="text-center py-16 text-[#A1A1AA] text-sm">
                  No active sessions right now
                </div>
              ) : (
                <div className="overflow-x-auto">
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
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
