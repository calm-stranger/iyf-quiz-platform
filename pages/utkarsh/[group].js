import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { EVENT_INFO, GROUPS, findGroup } from '../../lib/utkarsh';
import { UtkarshHeader } from '../../components/UtkarshHeader';

/**
 * Entry form for one group.
 *
 * Collects name, date of birth and school. Those three together become the
 * student_key the attempt is unique on — the name alone used to be the key,
 * which locked the second student of any repeated name out of their own quiz.
 * Registration codes are checked at the desk, not here.
 *
 * The group's quiz slug is carried in sessionStorage through /instructions to
 * /api/start, so the student enters their own group's quiz rather than
 * whichever one happens to be active.
 */
export default function UtkarshGroup({ group }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState('');
  const [quizState, setQuizState] = useState({ loading: true, isActive: false, title: '' });

  useEffect(() => {
    if (!group) return;
    fetch(`/api/active-quiz?slug=${encodeURIComponent(group.slug)}`)
      .then((res) => res.json())
      .then((data) => setQuizState({ loading: false, isActive: !!data.isActive, title: data.title || '' }))
      // A failed check should not block a student who is sitting in front of
      // us — /api/start is the real gate and will refuse properly.
      .catch(() => setQuizState({ loading: false, isActive: true, title: '' }));
  }, [group]);

  if (!group) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] p-6">
        <div className="mx-auto max-w-md pt-16 text-center">
          <p className="text-sm text-[#52525B]">That group does not exist.</p>
          <Link href="/utkarsh" className="mt-4 inline-block text-sm font-medium text-[#1B3A9C] underline">
            Back to the groups
          </Link>
        </div>
      </div>
    );
  }

  const handleContinue = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedSchool = school.trim();

    if (trimmedName.length < 2) return setError('Please enter your full name.');
    if (!dob) return setError('Please enter your date of birth.');
    if (trimmedSchool.length < 2) return setError('Please enter your school name.');

    sessionStorage.setItem('studentName', trimmedName);
    sessionStorage.setItem('studentDob', dob);
    sessionStorage.setItem('studentSchool', trimmedSchool);
    sessionStorage.setItem('quizSlug', group.slug);
    // Left over from an earlier attempt on the standalone form, and it would
    // otherwise be sent along and end up in this student's key.
    sessionStorage.removeItem('studentEmail');
    router.push('/instructions');
  };

  const field =
    'w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-[#18181B] ' +
    'placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#1B3A9C] ' +
    'focus:border-transparent text-sm';

  return (
    <>
      <Head>
        <title>{`${group.label} — ${EVENT_INFO.competition}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#F7F6F3] px-5 py-10">
        <div className="mx-auto w-full max-w-md">
          <UtkarshHeader />

          <div className="mt-7 flex items-center gap-3">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${group.accent} text-base font-bold text-white`}>
              {group.code}
            </span>
            <div>
              <h1 className="text-xl font-semibold text-[#18181B]">{group.label}</h1>
              <p className="text-sm text-[#71717A]">{group.classes}</p>
            </div>
          </div>

          {quizState.loading ? (
            <p className="mt-8 text-sm text-[#71717A]">Checking…</p>
          ) : !quizState.isActive ? (
            <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-medium text-amber-900">
                {group.label}&rsquo;s quiz has not been opened yet.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-amber-800">
                Wait for the announcement at the temple, then refresh this page. Do not close it.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-7 text-sm text-[#71717A]">Enter your details to begin</p>

              <form onSubmit={handleContinue} className="mt-4">
                <label className="mb-2 block text-sm font-medium text-[#3F3F46]">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="e.g. Ananya Sharma"
                  autoFocus
                  autoComplete="name"
                  className={field}
                />

                <label className="mb-2 mt-4 block text-sm font-medium text-[#3F3F46]">Date of birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => { setDob(e.target.value); setError(''); }}
                  className={field}
                />

                <label className="mb-2 mt-4 block text-sm font-medium text-[#3F3F46]">School</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => { setSchool(e.target.value); setError(''); }}
                  placeholder="e.g. Don Bosco School, Panbazar"
                  autoComplete="organization"
                  className={field}
                />

                {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}

                <button
                  type="submit"
                  className="mt-5 w-full rounded-xl bg-[#1B3A9C] py-3 text-sm font-medium text-white transition-colors hover:bg-[#16307f]"
                >
                  Continue →
                </button>
              </form>

              <p className="mt-5 text-center text-xs leading-relaxed text-[#A1A1AA]">
                Keep your registration code with you — it is checked at the desk.
              </p>
            </>
          )}

          <Link href="/utkarsh" className="mt-8 block text-center text-xs text-[#71717A] underline">
            Wrong group? Go back
          </Link>
        </div>
      </div>
    </>
  );
}

/* Pre-rendered: three known groups, no database call needed to draw the page. */
export function getStaticPaths() {
  return {
    paths: GROUPS.map((g) => ({ params: { group: g.code.toLowerCase() } })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const group = findGroup(params.group);
  if (!group) return { notFound: true };
  return { props: { group } };
}
