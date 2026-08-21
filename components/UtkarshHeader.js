import { EVENT_INFO } from '../lib/utkarsh';

/**
 * The Utkarsh wordmark, shown at the top of every page under /utkarsh.
 *
 * Type only, no image: it is the first thing that renders on a phone on temple
 * wifi with seventy students connecting at once, and a logo file is one more
 * request that can hang.
 */
export function UtkarshHeader({ subtitle }) {
  return (
    <header className="border-b-2 border-[#1B3A9C] pb-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-extrabold leading-none tracking-[0.18em] text-[#1B3A9C]">
            {EVENT_INFO.name.toUpperCase()}
          </p>
          <p className="mt-1.5 text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-[#E5187F]">
            {EVENT_INFO.tagline}
          </p>
        </div>
        <p className="shrink-0 pb-0.5 text-[11px] font-semibold text-[#71717A]">
          {EVENT_INFO.organiser.split(',')[0]} · {EVENT_INFO.edition}
        </p>
      </div>
      {subtitle ? (
        <p className="mt-2 text-sm font-medium text-[#3F3F46]">{subtitle}</p>
      ) : null}
    </header>
  );
}
