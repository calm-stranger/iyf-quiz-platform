import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Quiz() {
  const router = useRouter();

  const [quizMeta, setQuizMeta] = useState(null);  // { questions, startTime, duration, studentName }
  const [answers, setAnswers] = useState({});        // { [qIndex]: selectedOptionIndex }
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);    // seconds
  const [showWarning, setShowWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitReason, setSubmitReason] = useState(''); // for overlay message

  // Refs — so event handlers always see latest values without re-registering
  const submittedRef = useRef(false);
  const violationInProgressRef = useRef(false);
  const answersRef = useRef({});
  const quizMetaRef = useRef(null);
  const lastViolationTimeRef = useRef(0);
  const blurTimerRef = useRef(null);

  // ─── Load quiz data from sessionStorage ────────────────────────────────────
  useEffect(() => {
    const sessionId = sessionStorage.getItem('sessionId');
    const metaStr = sessionStorage.getItem('quizMeta');

    if (!sessionId || !metaStr) {
      router.replace('/');
      return;
    }

    const meta = JSON.parse(metaStr);
    quizMetaRef.current = meta;
    setQuizMeta(meta);

    // Restore saved answers
    const savedAnswers = localStorage.getItem(`qa:${sessionId}`);
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);
        answersRef.current = parsed;
        setAnswers(parsed);
      } catch {}
    }

    // Calculate initial time remaining
    const elapsed = Date.now() - meta.startTime;
    const remaining = Math.max(0, meta.duration - elapsed);
    setTimeLeft(Math.floor(remaining / 1000));

    // Disable browser back button
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
    };
  }, [router]);

  // ─── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      doSubmit(true, 'Time expired');
      return;
    }

    const tick = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(tick);
  }, [timeLeft]);

  // ─── Anti-cheat listeners ───────────────────────────────────────────────────
  const handleViolation = useCallback(async () => {
    if (submittedRef.current) return;

    // Debounce: don't double-fire within 2 seconds
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 2000) return;
    lastViolationTimeRef.current = now;

    if (violationInProgressRef.current) return;
    violationInProgressRef.current = true;

    const sessionId = sessionStorage.getItem('sessionId');

    try {
      const res = await fetch('/api/violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();

      if (data.action === 'warn') {
        setShowWarning(true);
      } else if (data.action === 'submit') {
        doSubmit(true, 'Tab / app switch detected');
      }
    } catch {
      // Network failed — use local fallback count stored in sessionStorage
      const localViolations = parseInt(sessionStorage.getItem('lv') || '0') + 1;
      sessionStorage.setItem('lv', String(localViolations));

      if (localViolations === 1) {
        setShowWarning(true);
      } else {
        doSubmit(true, 'Tab / app switch detected');
      }
    } finally {
      violationInProgressRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!quizMeta) return;

    // Tab visibility change (tab switch, minimize, etc.)
    const onVisibilityChange = () => {
      if (document.hidden && !submittedRef.current) {
        handleViolation();
      }
    };

    // Window blur — catches Alt+Tab, switching to another app
    // Uses a 3-second grace to avoid false positives from OS popups
    const onBlur = () => {
      blurTimerRef.current = setTimeout(() => {
        if (!document.hidden && !submittedRef.current) {
          handleViolation();
        }
      }, 3000);
    };

    const onFocus = () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };

    // Block common keyboard escape hatches
    const onKeyDown = (e) => {
      const blocked =
        (e.ctrlKey || e.metaKey) &&
        ['t', 'n', 'Tab', 'w'].includes(e.key);
      if (blocked || (e.altKey && e.key === 'Tab') || e.key === 'F12') {
        e.preventDefault();
      }
    };

    // Block right-click context menu
    const onContextMenu = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('contextmenu', onContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('contextmenu', onContextMenu);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, [quizMeta, handleViolation]);

  // ─── Select an answer ───────────────────────────────────────────────────────
  const selectAnswer = useCallback((qIndex, optionIndex) => {
    const newAnswers = { ...answersRef.current, [qIndex]: optionIndex };
    answersRef.current = newAnswers;
    setAnswers(newAnswers);

    const sessionId = sessionStorage.getItem('sessionId');
    if (sessionId) {
      localStorage.setItem(`qa:${sessionId}`, JSON.stringify(newAnswers));
    }
  }, []);

  // ─── Submit quiz ────────────────────────────────────────────────────────────
  const doSubmit = useCallback(async (auto = false, reason = '') => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    setSubmitting(true);
    setSubmitReason(auto ? reason || 'Auto-submitting…' : 'Submitting your quiz…');

    const sessionId = sessionStorage.getItem('sessionId');
    const meta = quizMetaRef.current;

    if (!sessionId || !meta) {
      router.replace('/done');
      return;
    }

    // Build answers array — -1 means unanswered
    const answersArray = meta.questions.map((_, i) =>
      answersRef.current[i] !== undefined ? answersRef.current[i] : -1
    );

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers: answersArray, autoSubmitted: auto }),
      });
      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem('quizResult', JSON.stringify(data));
      }
    } catch {
      // Submit best-effort; always navigate to done
    }

    sessionStorage.removeItem('sessionId');
    sessionStorage.removeItem('quizMeta');
    const sid = sessionId;
    if (sid) localStorage.removeItem(`qa:${sid}`);

    router.replace('/done');
  }, [router]);

  const confirmSubmit = () => {
    const answered = Object.keys(answers).length;
    const total = quizMeta?.questions.length || 0;
    const msg =
      answered < total
        ? `You've answered ${answered} of ${total} questions. Unanswered questions will be marked wrong. Submit anyway?`
        : `Submit your quiz? You've answered all ${total} questions.`;
    if (window.confirm(msg)) doSubmit(false);
  };

  // ─── Derived display values ─────────────────────────────────────────────────
  if (!quizMeta || timeLeft === null) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-6 h-6 text-[#A1A1AA]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-[#71717A]">Loading your quiz…</p>
        </div>
      </div>
    );
  }

  const { questions, studentName } = quizMeta;
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentQ];

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isCritical = timeLeft < 300; // < 5 minutes
  const timerStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const progressPct = ((currentQ + 1) / totalQ) * 100;

  return (
    <>
      <Head>
        <title>Quiz — {studentName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ── Warning Modal ─────────────────────────────────────────────────── */}
      {showWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="modal-card bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">⚠️</span>
                </div>
                <h2 className="text-white font-semibold">Violation Detected</h2>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-[#18181B] font-medium mb-2">Tab or application switch detected!</p>
              <p className="text-[#52525B] text-sm mb-1">
                This is your <strong>first and final warning.</strong>
              </p>
              <p className="text-[#52525B] text-sm">
                If you switch tabs or apps again, your quiz will be{' '}
                <strong>automatically submitted</strong> with your current answers.
              </p>
            </div>
            <div className="px-6 pb-5">
              <button
                onClick={() => setShowWarning(false)}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-red-700 transition-colors"
              >
                I Understand — Continue Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submitting overlay ────────────────────────────────────────────── */}
      {submitting && (
        <div className="fixed inset-0 z-50 bg-white/95 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin w-10 h-10 text-[#18181B] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="font-medium text-[#18181B]">{submitReason}</p>
            <p className="text-sm text-[#71717A] mt-1">Please wait…</p>
          </div>
        </div>
      )}

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-[#E4E4E7]">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
          {/* Q progress */}
          <div className="text-xs text-[#71717A]">
            <span className="font-medium text-[#18181B]">{currentQ + 1}</span>
            <span className="text-[#A1A1AA]"> / {totalQ}</span>
          </div>

          {/* Timer */}
          <div className={`font-mono font-semibold text-xl tracking-tight ${isCritical ? 'timer-critical' : 'text-[#18181B]'}`}>
            {timerStr}
          </div>

          {/* Answered count */}
          <div className="text-xs text-[#71717A]">
            <span className="font-medium text-[#18181B]">{answeredCount}</span>
            <span className="text-[#A1A1AA]"> done</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-[#F4F4F5]">
          <div
            className="h-full bg-[#18181B] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="pt-[60px] min-h-screen bg-[#F7F6F3]">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Question card */}
          <div className="bg-white rounded-2xl border border-[#E4E4E7] p-4 sm:p-6 mb-4">
            <div className="text-xs font-medium text-[#71717A] uppercase tracking-widest mb-3">
              Question {currentQ + 1}
            </div>
            {/* whitespace-pre-line so an assertion-and-reason question keeps the
                two statements on separate lines instead of running together. */}
            <p className="text-[#18181B] text-[15px] sm:text-base font-medium leading-relaxed break-words whitespace-pre-line">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5 mb-6">
            {currentQuestion.options.map((option, i) => {
              const isSelected = answers[currentQ] === i;
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(currentQ, i)}
                  className={`option-btn w-full text-left rounded-xl border-2 px-4 sm:px-5 py-4 flex items-start sm:items-center gap-3 sm:gap-4 min-h-[64px] ${
                    isSelected
                      ? 'selected border-[#18181B] bg-[#18181B] text-white'
                      : 'border-[#E4E4E7] bg-white text-[#3F3F46] hover:border-[#A1A1AA]'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border ${
                      isSelected
                        ? 'border-white/30 bg-white/20 text-white'
                        : 'border-[#D4D4D8] text-[#71717A]'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm sm:text-[15px] font-medium leading-relaxed min-w-0 break-words">{option}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <button
              onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
              disabled={currentQ === 0}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl border border-[#D4D4D8] text-[#52525B] text-sm font-medium disabled:opacity-30 hover:bg-white hover:border-[#A1A1AA] transition-colors"
            >
              ← Previous
            </button>

            {currentQ < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQ((q) => q + 1)}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-[#18181B] text-white text-sm font-medium hover:bg-[#27272A] transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={confirmSubmit}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Submit Quiz ✓
              </button>
            )}
          </div>

          {/* Question grid navigator */}
          <div className="bg-white rounded-2xl border border-[#E4E4E7] p-3 sm:p-4">
            <p className="text-xs text-[#A1A1AA] mb-3 font-medium uppercase tracking-widest">
              Questions ({answeredCount}/{totalQ} answered)
            </p>
            <div className="grid grid-cols-5 xs:grid-cols-6 sm:flex sm:flex-wrap gap-2">
              {questions.map((_, i) => {
                const isAnswered = answers[i] !== undefined;
                const isCurrent = i === currentQ;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`q-dot w-full sm:w-9 aspect-square sm:h-9 rounded-lg text-xs font-semibold ${
                      isCurrent
                        ? 'bg-[#18181B] text-white ring-2 ring-offset-1 ring-[#18181B]'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7]'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {answeredCount === totalQ && (
              <div className="mt-4 pt-4 border-t border-[#F4F4F5]">
                <button
                  onClick={confirmSubmit}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Submit Quiz ✓
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-[#A1A1AA] mt-4">
            {studentName} · Switching tabs or apps will auto-submit your quiz
          </p>
        </div>
      </div>
    </>
  );
}
