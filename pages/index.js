import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [quizTitle, setQuizTitle] = useState('Loading...');
  const [isActive, setIsActive] = useState(true);
  const router = useRouter();

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

          {!isActive ? (
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
