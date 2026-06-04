import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleContinue = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    sessionStorage.setItem('studentName', trimmed);
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
            Online Assessment
          </h1>
          <p className="text-[#71717A] text-sm text-center mb-8">
            Enter your name to begin
          </p>

          <form onSubmit={handleContinue}>
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
              placeholder="e.g. Priya Sharma"
              autoFocus
              autoComplete="name"
              className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:border-transparent text-sm"
              style={{ userSelect: 'text' }}
            />
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
            Use the name your teacher registered you with
          </p>
        </div>
      </div>
    </>
  );
}
