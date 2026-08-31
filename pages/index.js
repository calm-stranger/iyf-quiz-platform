import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Quiz unlock time — 9:00 PM IST on 31 Aug 2026.
// IST = UTC+05:30, so 21:00 IST = 15:30 UTC.
const QUIZ_UNLOCK_TIME = new Date('2026-08-31T15:30:00Z');

function useCountdown(unlockTime) {
  const [remaining, setRemaining] = useState(() => Math.max(0, unlockTime - Date.now()));
  const timerRef = useRef(null);

  useEffect(() => {
    if (remaining <= 0) return;
    timerRef.current = setInterval(() => {
      const left = Math.max(0, unlockTime - Date.now());
      setRemaining(left);
      if (left === 0) clearInterval(timerRef.current);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [unlockTime]);

  const hours   = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  const unlocked = remaining === 0;
  return { hours, minutes, seconds, unlocked };
}

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [quizTitle, setQuizTitle] = useState('Loading...');
  const [isActive, setIsActive] = useState(true);
  const router = useRouter();
  const { hours, minutes, seconds, unlocked } = useCountdown(QUIZ_UNLOCK_TIME.getTime());

  useEffect(() => {
    fetch('/api/active-quiz')
      .then((res) => res.json())
      .then((data) => {
        if (data.title) {
          setQuizTitle(data.title);
        }
        if (data.isActive !== undefined) {
          setIsActive(data.isActive);
        }
      })
      .catch(() => {
        setQuizTitle('Online Assessment');
        setIsActive(true);
      });
  }, []);

  const handleContinue = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedDob = dob.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!trimmedDob) {
      setError('Please enter your date of birth.');
      return;
    }

    sessionStorage.setItem('studentName', trimmedName);
    sessionStorage.setItem('studentEmail', trimmedEmail);
    sessionStorage.setItem('studentDob', trimmedDob);
    router.push('/instructions');
  };

  return (
    <>
      <Head>
        <title>Online Quiz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo mark */}
          <div className="flex justify-center mb-10">
            <div className="w-14 h-14 bg-[#18181B] rounded-2xl flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-[#18181B] text-center mb-1">
            {quizTitle}
          </h1>

          {!unlocked ? (
            /* ── Countdown lock screen ── */
            <div className="mt-8 text-center">
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-3">Quiz opens at</p>
                <p className="text-3xl font-bold text-[#18181B] mb-1">9:00 PM tonight</p>
                <p className="text-xs text-[#A1A1AA]">(Indian Standard Time)</p>
              </div>
              <div className="flex justify-center gap-3 mb-2">
                {[{ v: hours, l: 'hrs' }, { v: minutes, l: 'min' }, { v: seconds, l: 'sec' }].map(({ v, l }) => (
                  <div key={l} className="flex flex-col items-center bg-[#18181B] text-white rounded-xl px-4 py-3 min-w-[64px]">
                    <span className="text-2xl font-bold tabular-nums">{String(v).padStart(2, '0')}</span>
                    <span className="text-[10px] uppercase tracking-widest text-[#A1A1AA] mt-0.5">{l}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#A1A1AA] mt-3">This page will unlock automatically — no need to refresh.</p>
            </div>
          ) : !isActive ? (
            <div className="mt-8 text-center p-6 bg-red-50 text-red-800 rounded-xl border border-red-100">
              <p className="font-medium text-sm">There is currently no active quiz.</p>
              <p className="text-xs mt-2 text-red-600">Please contact the administrator for more information.</p>
            </div>
          ) : (
            <>
              <p className="text-[#71717A] text-sm text-center mb-8">
                Enter your details to begin
              </p>

              <form onSubmit={handleContinue}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#3F3F46] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    placeholder="e.g. Sahil Agarwala"
                    autoFocus
                    autoComplete="name"
                    className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-transparent text-sm"
                    style={{ userSelect: 'text' }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#3F3F46] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="e.g. sahil@example.com"
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-transparent text-sm"
                    style={{ userSelect: 'text' }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#3F3F46] mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => {
                      setDob(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-transparent text-sm"
                    style={{ userSelect: 'text' }}
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-xs mt-2">{error}</p>
                )}

                <button
                  type="submit"
                  className="w-full mt-4 bg-[#18181B] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#27272A] transition-colors"
                >
                  Continue →
                </button>
              </form>

              <p className="text-center text-xs text-[#A1A1AA] mt-6">
                please fill in all required fields.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
