import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { nextRound, roundOf } from '../lib/utkarsh';

export default function Done() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  /*
    The Utkarsh quiz runs in two rounds. Rather than send a student back to
    the group page to type their name again, the next round is offered right
    here and started in place — they were sitting in front of us thirty
    seconds ago, and nothing about them has changed.
  */
  const [finished, setFinished] = useState(null);   // which round just ended
  const [next, setNext] = useState(null);           // the round after it, if open
  const [starting, setStarting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [nextError, setNextError] = useState('');

  useEffect(() => {
    const r = sessionStorage.getItem('quizResult');
    if (r) {
      try {
        const parsed = JSON.parse(r);
        setResult(parsed);
        setAutoSubmitted(parsed.autoSubmitted || false);
      } catch {}
    }

    const slug = sessionStorage.getItem('quizSlug');
    if (!slug) return;
    setFinished(roundOf(slug));

    const upcoming = nextRound(slug);
    if (!upcoming) return;

    // Only offer it once it is actually open, so nobody presses a button that
    // can only fail.
    fetch(`/api/active-quiz?slug=${encodeURIComponent(upcoming.slug)}`)
      .then((res) => res.json())
      .then((data) => setNext(data?.isActive ? upcoming : { ...upcoming, waiting: true }))
      .catch(() => setNext({ ...upcoming, waiting: true }));
  }, []);

  const startNextRound = async () => {
    if (!next || starting) return;
    setStarting(true);
    setNextError('');

    try {
      const res = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sessionStorage.getItem('studentName'),
          dob: sessionStorage.getItem('studentDob'),
          school: sessionStorage.getItem('studentSchool') || undefined,
          email: sessionStorage.getItem('studentEmail') || undefined,
          quizSlug: next.slug,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setNextError(data.error || 'Could not start the next round.');
        setStarting(false);
        return;
      }

      sessionStorage.setItem('quizSlug', next.slug);
      sessionStorage.setItem('sessionId', data.sessionId);
      sessionStorage.setItem('quizMeta', JSON.stringify({
        questions: data.questions,
        startTime: data.startTime,
        duration: data.duration,
        studentName: sessionStorage.getItem('studentName'),
      }));
      // Left over from the round just finished.
      sessionStorage.removeItem('quizResult');
      sessionStorage.removeItem('lv');

      router.push('/quiz');
    } catch {
      setNextError('Network error. Please try again.');
      setStarting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Submitted — Online Quiz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                autoSubmitted ? 'bg-amber-100' : 'bg-emerald-100'
              }`}
            >
              {autoSubmitted ? (
                <span className="text-3xl">⚠️</span>
              ) : (
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-[#18181B] mb-2">
            {autoSubmitted
              ? 'Auto-Submitted'
              : finished
                ? `${finished.label} submitted!`
                : 'Quiz Submitted!'}
          </h1>

          <p className="text-[#71717A] text-sm leading-relaxed mb-8">
            {autoSubmitted
              ? 'Your quiz was automatically submitted due to a tab or application switch violation.'
              : next
                ? 'Your answers have been recorded.'
                : 'Your responses have been recorded successfully. You may now close this window.'}
          </p>

          {/* Stats (if available) */}
          {result && (
            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-5 text-left mb-6">
              <p className="text-xs text-[#A1A1AA] uppercase tracking-widest mb-3">Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#71717A]">Questions answered</span>
                  <span className="font-medium text-[#18181B]">
                    {result.answeredCount ?? '—'} / {result.total ?? '—'}
                  </span>
                </div>
                {result.timeTakenStr && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717A]">Time taken</span>
                    <span className="font-medium text-[#18181B]">{result.timeTakenStr}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {next ? (
            next.waiting ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-left">
                <p className="text-sm font-medium text-amber-900">
                  {next.label} has not been opened yet
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                  Keep this page open and wait for the announcement, then refresh.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#1B3A9C] bg-white px-4 py-4 text-left">
                {!confirming ? (
                  <>
                    <p className="text-sm font-medium text-[#18181B]">
                      {next.label} is ready
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#71717A]">
                      {next.questions} questions. You do not need to enter your details again.
                    </p>
                    <button
                      onClick={() => setConfirming(true)}
                      className="mt-3 w-full rounded-xl bg-[#1B3A9C] py-3 text-sm font-medium text-white transition-colors hover:bg-[#16307f]"
                    >
                      Go to {next.label} →
                    </button>
                  </>
                ) : (
                  /*
                    A deliberate stop before the timer starts. A child who taps
                    the wrong thing on a phone should not find themselves three
                    minutes into a timed round they did not mean to open, and
                    there is no way back once it has begun.
                  */
                  <>
                    <p className="text-sm font-medium text-[#18181B]">
                      Ready to begin {next.label}?
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#52525B]">
                      <li>• {next.questions} questions.</li>
                      <li>• The timer starts the moment you begin.</li>
                      <li>• You cannot go back to {finished?.label || 'the previous round'}.</li>
                      <li>• Do not switch apps or leave this page once you start.</li>
                    </ul>
                    <button
                      onClick={startNextRound}
                      disabled={starting}
                      className="mt-3 w-full rounded-xl bg-[#1B3A9C] py-3 text-sm font-medium text-white transition-colors hover:bg-[#16307f] disabled:opacity-40"
                    >
                      {starting ? 'Starting…' : `Yes, begin ${next.label}`}
                    </button>
                    <button
                      onClick={() => setConfirming(false)}
                      disabled={starting}
                      className="mt-2 w-full rounded-xl border border-[#D4D4D8] py-2.5 text-sm font-medium text-[#3F3F46] disabled:opacity-40"
                    >
                      Not yet
                    </button>
                  </>
                )}
                {nextError ? (
                  <p className="mt-2 text-xs text-red-500">{nextError}</p>
                ) : null}
              </div>
            )
          ) : (
            <div className="bg-[#F4F4F5] rounded-xl px-4 py-3">
              <p className="text-xs text-[#71717A]">
                Your score will be shared by your teacher. You can close this window now.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
