import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Done() {
  const [result, setResult] = useState(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    const r = sessionStorage.getItem('quizResult');
    if (r) {
      try {
        const parsed = JSON.parse(r);
        setResult(parsed);
        setAutoSubmitted(parsed.autoSubmitted || false);
      } catch {}
    }
  }, []);

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
            {autoSubmitted ? 'Quiz Auto-Submitted' : 'Quiz Submitted!'}
          </h1>

          <p className="text-[#71717A] text-sm leading-relaxed mb-8">
            {autoSubmitted
              ? 'Your quiz was automatically submitted due to a tab or application switch violation.'
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

          <div className="bg-[#F4F4F5] rounded-xl px-4 py-3">
            <p className="text-xs text-[#71717A]">
              Your score will be shared by your teacher. You can close this window now.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
