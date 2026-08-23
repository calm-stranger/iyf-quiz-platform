import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

/*
  Fallbacks only. The real numbers come from the quiz the student is about to
  sit — see the fetch below. Hardcoding them means the page can promise 25
  minutes while the timer gives 20, and the student plans around the wrong one.
*/
const FALLBACK_DURATION_MINS = 20;
const FALLBACK_QUESTION_COUNT = 15;

const buildRules = (durationMins) => [
  {
    icon: '🚫',
    text: 'Do not switch browser tabs or open new tabs.',
  },
  {
    icon: '📵',
    text: 'Do not switch to another application, check notifications, or let your screen turn off. These will trigger a cheating violation.',
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
    text: `You have ${durationMins} minutes. The quiz auto-submits when time runs out.`,
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
  const [studentSchool, setStudentSchool] = useState('');
  const [quizSlug, setQuizSlug] = useState('');
  const [durationMins, setDurationMins] = useState(FALLBACK_DURATION_MINS);
  const [questionCount, setQuestionCount] = useState(FALLBACK_QUESTION_COUNT);

  const rules = buildRules(durationMins);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nextRound, setNextRound] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const name = sessionStorage.getItem('studentName');
    const email = sessionStorage.getItem('studentEmail');
    const dob = sessionStorage.getItem('studentDob');
    const school = sessionStorage.getItem('studentSchool');
    const slug = sessionStorage.getItem('quizSlug');

    /*
      Two entry points now lead here. The standalone form collects an email;
      the Utkarsh group form collects a school and the slug of that group's
      quiz. Either is enough, so send them back to whichever they came from
      rather than always to /.
    */
    if (!name || !dob || (!email && !school)) {
      router.replace(slug ? '/utkarsh' : '/');
      return;
    }
    setStudentName(name);
    setStudentEmail(email || '');
    setStudentDob(dob);
    setStudentSchool(school || '');
    setQuizSlug(slug || '');

    fetch('/api/active-quiz' + (slug ? `?slug=${encodeURIComponent(slug)}` : ''))
      .then((res) => res.json())
      .then((data) => {
        if (data?.durationMinutes) setDurationMins(data.durationMinutes);
        if (data?.questionCount) setQuestionCount(data.questionCount);
      })
      .catch(() => {
        /* keep the fallbacks — the numbers are guidance, /api/start is the gate */
      });
  }, [router]);

  const handleStart = async () => {
    if (!agreed || loading) return;
    setLoading(true);
    setError('');
    setNextRound(null);

    try {
      const res = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName,
          email: studentEmail || undefined,
          dob: studentDob,
          school: studentSchool || undefined,
          // Absent for the standalone flow, which still resolves the single
          // globally active quiz exactly as before.
          quizSlug: quizSlug || undefined
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not start the quiz. Please try again.');
        // The round they asked for is done, but a later one is open and still
        // theirs to sit — offer it instead of leaving them at a dead end.
        setNextRound(data.nextRound || null);
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
              <p className="font-semibold text-[#18181B]">{durationMins} minutes</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E4E4E7] px-4 py-3 text-center">
              <p className="text-xs text-[#A1A1AA] mb-0.5">Questions</p>
              <p className="font-semibold text-[#18181B]">{questionCount} MCQs</p>
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

          {nextRound && (
            <div className="mb-4 rounded-xl border border-[#18181B] bg-white p-4">
              <p className="text-sm font-semibold text-[#18181B]">
                You have already finished that round.
              </p>
              <p className="mt-1 text-sm text-[#52525B]">
                {nextRound.label} is open and you have not sat it yet. Your answers from
                the round you finished are safely saved.
              </p>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('quizSlug', nextRound.slug);
                  setQuizSlug(nextRound.slug);
                  setError('');
                  setNextRound(null);
                }}
                className="mt-3 w-full rounded-xl bg-[#18181B] py-3 text-sm font-medium text-white hover:bg-[#27272A]"
              >
                Continue to {nextRound.label} →
              </button>
            </div>
          )}

          {error && !nextRound && (
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
