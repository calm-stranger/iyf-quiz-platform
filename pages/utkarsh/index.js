import Head from 'next/head';
import Link from 'next/link';
import { EVENT_INFO, GROUPS } from '../../lib/utkarsh';
import { UtkarshHeader } from '../../components/UtkarshHeader';

/**
 * The Utkarsh quiz landing page.
 *
 * Deliberately a fork of the standalone `/` flow rather than a rewrite of it:
 * that page is deployed and was used for Purushottam month, and four days
 * before a live event is the wrong time to restructure something that works.
 * Everything below /utkarsh is additive.
 */
export default function UtkarshHome() {
  return (
    <>
      <Head>
        <title>{`${EVENT_INFO.name} — ${EVENT_INFO.competition}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#F7F6F3] px-5 py-10">
        <div className="mx-auto w-full max-w-md">
          <UtkarshHeader />

          <h1 className="mt-8 text-2xl font-semibold text-[#18181B]">
            {EVENT_INFO.competition}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#52525B]">{EVENT_INFO.blurb}</p>

          <ul className="mt-5 space-y-2">
            {EVENT_INFO.rules.map((rule) => (
              <li key={rule} className="flex gap-2.5 text-sm text-[#52525B]">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#E5187F]" />
                {rule}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-[#71717A]">
            Choose your group
          </p>

          <div className="mt-3 space-y-3">
            {GROUPS.map((group) => (
              <Link
                key={group.code}
                href={`/utkarsh/${group.code.toLowerCase()}`}
                className="flex items-center gap-4 rounded-2xl border border-[#D4D4D8] bg-white p-4 transition-colors hover:border-[#18181B]"
              >
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${group.accent} text-lg font-bold text-white`}
                >
                  {group.code}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-[#18181B]">
                    {group.label}
                  </span>
                  <span className="block text-sm text-[#71717A]">{group.classes}</span>
                </span>
                <span className="shrink-0 text-[#A1A1AA]">→</span>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-[#A1A1AA]">
            Not sure which group? It is the class you are studying in this year.
          </p>
        </div>
      </div>
    </>
  );
}
