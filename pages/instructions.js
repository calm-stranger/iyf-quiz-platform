import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const QUIZ_DURATION_MINS = 30;
const QUESTION_COUNT = 25;

const rules = [
  {
    icon: '🚫',
    text: 'Do not switch browser tabs or open new tabs.',
  },
  {
    icon: '📵',
    text: 'Do not switch to another application or minimize this window.',
  },
  {
    icon: '⚠️',
    text: 'First violation = warning. Second violation = your quiz is auto-submitted immediately.',
  },
  {
    icon: '🔄',
    text: 'Do not refresh the page. Your progress is auto-saved but a refresh may trigger a violation.',
  },
  {
    icon: '⏱️',
    text: `You have ${QUIZ_DURATION_MINS} minutes. The quiz auto-submits when time runs out.`,
  },
  {
    icon: '✅',
    text: 'You can navigate between questions freely. Review before submitting.',
  },
];

export default function Instructions() {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentDob, setStudentDob] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const name = sessionStorage.getItem('studentName');
    const email = sessionStorage.getItem('studentEmail');
    const dob = sessionStorage.getItem('studentDob');

    if (!name || !email || !dob) {
      router.replace('/');
      return;
    }
    setStudentName(name);
    setStudentEmail(email);
    setStudentDob(dob);
  }, [router]);

  const handleStart = async () => {
    if (!agreed || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName,
          email: studentEmail,
          dob: studentDob
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not start the quiz. Please try again.');
        setLoading(false);
        return;
      }

      // Store quiz metadata for the quiz page
      sessionStorage.setItem('sessionId', data.sessionId);
      sessionStorage.setItem('quizMeta', JSON.stringify({
        questions: data.questions,
        startTime: data.startTime,
        duration: data.duration,
        studentName,
      }));

      router.push('/quiz');
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Instructions — Online Quiz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs text-[#A1A1AA] uppercase tracking-widest mb-1">
              Hare Krishna, {studentName}
            </p>
            <h1 className="text-2xl font-semibold text-[#18181B]">
              Before You Begin
            </h1>
          </div>

          {/* Alert banner */}
          <div className="bg-amber-50 border border-amber-300 rounded-2xl px-5 py-4 mb-5 flex gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="font-medium text-amber-900 text-sm">Anti-cheating system is active</p>
              <p className="text-amber-700 text-xs mt-0.5">
                Tab switching and app switching are monitored. Two violations will auto-submit your quiz.
              </p>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-white rounded-2xl border border-[#E4E4E7] divide-y divide-[#F4F4F5] mb-5">
            {rules.map((rule, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <span className="text-base flex-shrink-0 mt-0.5">{rule.icon}</span>
                <p className="text-sm text-[#3F3F46]">{rule.text}</p>
              </div>
            ))}
          </div>

          {/* Quiz details strip */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-[#E4E4E7] px-4 py-3 text-center">
              <p className="text-xs text-[#A1A1AA] mb-0.5">Duration</p>
              <p className="font-semibold text-[#18181B]">{QUIZ_DURATION_MINS} minutes</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E4E4E7] px-4 py-3 text-center">
              <p className="text-xs text-[#A1A1AA] mb-0.5">Questions</p>
              <p className="font-semibold text-[#18181B]">{QUESTION_COUNT} MCQs</p>
            </div>
          </div>

          {/* Agree checkbox */}
          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded"
              />
            </div>
            <span className="text-sm text-[#52525B]">
              I have read and understood all the instructions. I will not switch tabs or applications during the quiz.
            </span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!agreed || loading}
            className="w-full bg-[#18181B] text-white py-3.5 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#27272A] transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Starting…
              </span>
            ) : (
              'Start Quiz →'
            )}
          </button>

          <p className="text-center text-xs text-[#A1A1AA] mt-4">
            Once you start, the timer begins immediately.
          </p>
        </div>
      </div>
    </>
  );
}
