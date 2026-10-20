'use client';

// "Am I paid enough?" (Hugo, 2026-10-20). Sits under the tailored estimate: crew compare their pay to the range,
// hirers compare their offer. Posts to the paycheck-ingest function in SSS_Brain, which stores the pay with no
// name on it, writes the lead, puts WhatsApp sign-ups and hirers on Hugo's cards, and adds people who tick the
// email box to Flodesk (segments "Pay check: crew" / "Pay check: hiring").
import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Scale } from 'lucide-react';

type Intent = 'crew' | 'hiring';
type Currency = 'EUR' | 'USD';
type Bracket = { n: number; median?: number; p25?: number; p75?: number };
type Result = { pay_position: 'below' | 'inside' | 'above' | null; gap_eur: number; bracket: Bracket | null };

const ENDPOINT =
  process.env.NEXT_PUBLIC_PAYCHECK_URL ||
  'https://zmiikssbwzkukfqqxjew.supabase.co/functions/v1/paycheck-ingest';
const USD_PER_EUR = 1.1;   // same rate as the rest of the page
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];

const toDisplay = (eur: number, c: Currency) => Math.round(c === 'USD' ? eur * USD_PER_EUR : eur);
const fmt = (v: number, c: Currency) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(v);

function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  (window as unknown as { posthog?: { capture: (e: string, p?: object) => void } }).posthog?.capture(event, props);
}

export default function PayCheck(props: {
  department: string;
  position: string;
  yachtSize: string;
  yachtType: string;
  bandLowEur: number;
  bandHighEur: number;
  currency: Currency;
  bookCallUrl: (placement: string) => string;
}) {
  const { department, position, yachtSize, yachtType, bandLowEur, bandHighEur, currency } = props;
  const [intent, setIntent] = useState<Intent>('crew');
  const [pay, setPay] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(Result & { pay: number | null; checked: string }) | null>(null);
  const started = useRef(false);
  const src = useRef<Record<string, string>>({});

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    for (const k of UTM_KEYS) { const v = q.get(k); if (v) src.current[k] = v.slice(0, 120); }
    if (document.referrer && !document.referrer.includes(window.location.host)) src.current.referrer = document.referrer.slice(0, 120);
  }, []);

  const checking = `${position} on a ${yachtSize} ${yachtType.toLowerCase()} yacht`;
  // A new role picked above means the old answer no longer applies.
  useEffect(() => { setResult(null); }, [position, yachtSize, yachtType]);

  const range = useMemo(
    () => ({ low: toDisplay(bandLowEur, currency), high: toDisplay(bandHighEur, currency) }),
    [bandLowEur, bandHighEur, currency]
  );

  const onStart = () => {
    if (started.current) return;
    started.current = true;
    track('paycheck_started', { intent, position, yacht_size: yachtSize });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payNum = pay.trim() ? Number(pay.replace(/[^\d.]/g, '')) : null;
    if (payNum !== null && (!Number.isFinite(payNum) || payNum <= 0)) { setError('Pay needs to be a number, per month.'); return; }
    setBusy(true);
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'paycheck', intent, first_name: firstName, email, phone: phone.trim() || undefined,
          department, position, yacht_size: yachtSize, yacht_type: yachtType,
          band_low: bandLowEur, band_high: bandHighEur, pay: payNum ?? undefined, pay_currency: currency,
          consent, hp, src: src.current, page: window.location.pathname,
        }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok || !body.ok) { setError(body.error ? `${body.error[0].toUpperCase()}${body.error.slice(1)}.` : 'Something went wrong. Try again.'); return; }
      setResult({ pay_position: body.pay_position ?? null, gap_eur: body.gap_eur ?? 0, bracket: body.bracket ?? null, pay: payNum, checked: checking });
      track('paycheck_submitted', { intent, position, yacht_size: yachtSize, pay_position: body.pay_position ?? 'none', consent, whatsapp: Boolean(phone.trim()) });
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  const input = 'w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-orange-400/40 focus:ring-2 focus:ring-orange-500/20';

  return (
    <div id="pay-check" className="glass-card relative overflow-hidden rounded-[1.75rem] border border-cyan-400/20 p-6 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_55%)]" />
      <div className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-200">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Pay check</p>
              <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                {intent === 'crew' ? 'Am I paid enough?' : 'Is my offer competitive?'}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                {intent === 'crew'
                  ? 'Put your monthly pay next to the range for your role and see where you actually sit, plus what other crew in your bracket earn.'
                  : 'Put your offer next to the range for the role before you post it, so the crew you want actually apply.'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1 lg:w-72">
            {(['crew', 'hiring'] as Intent[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { setIntent(k); setResult(null); setError(null); }}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${intent === k ? 'bg-cyan-500/20 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
              >
                {k === 'crew' ? "I'm crew" : "I'm hiring"}
              </button>
            ))}
          </div>
        </div>

        {result ? (
          <PayCheckResult result={result} intent={intent} range={range} currency={currency} bookCallUrl={props.bookCallUrl} onAgain={() => setResult(null)} />
        ) : (
          <form onSubmit={submit} onFocus={onStart} className="mt-6 grid gap-4 md:grid-cols-2">
            <p className="text-sm text-slate-400 md:col-span-2">
              Checking: <span className="text-slate-200">{checking}</span>. Change the role above.
            </p>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                {intent === 'crew' ? 'Your monthly pay now' : 'What you plan to offer per month'}{' '}
                <span className="font-normal text-slate-400">({currency}, optional)</span>
              </span>
              <input inputMode="numeric" value={pay} onChange={(e) => setPay(e.target.value)} placeholder={`e.g. ${Math.round((range.low + range.high) / 2 / 50) * 50}`} className={input} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">First name</span>
              <input required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={input} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                WhatsApp <span className="font-normal text-slate-400">(optional, with country code)</span>
              </span>
              <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 7700 900123" className={input} />
            </label>
            <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" name="company_website" />
            <label className="flex items-start gap-3 text-sm leading-6 text-slate-300 md:col-span-2">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950/50 accent-orange-500" />
              <span>
                {intent === 'crew'
                  ? 'Email me crew pay updates and career tips from Hugo. Unsubscribe any time.'
                  : 'Email me crew market updates and hiring tips from Hugo. Unsubscribe any time.'}
              </span>
            </label>
            {error ? <p className="text-sm text-rose-300 md:col-span-2">{error}</p> : null}
            <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-xs leading-5 text-slate-400">
                {intent === 'crew'
                  ? 'Your pay goes into the crew pay data with no name on it. A bracket only shows numbers once 5 or more crew have shared. We use your details to answer you, and to email you only if you tick the box.'
                  : 'Offers are never added to the crew pay data. We use your details to answer you, and to email you only if you tick the box.'}
              </p>
              <button type="submit" disabled={busy} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#F74A1C] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#FF5A2C] disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {intent === 'crew' ? 'Check my pay' : 'Check my offer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PayCheckResult(props: {
  result: Result & { pay: number | null; checked: string };
  intent: Intent;
  range: { low: number; high: number };
  currency: Currency;
  bookCallUrl: (placement: string) => string;
  onAgain: () => void;
}) {
  const { result, intent, range, currency } = props;
  const gap = toDisplay(result.gap_eur, currency);
  const pos = result.pay_position;
  const b = result.bracket;
  const rangeText = `${fmt(range.low, currency)} to ${fmt(range.high, currency)}`;

  let headline: string;
  if (result.pay === null || !pos) headline = `The range for ${result.checked} is ${rangeText} a month.`;
  else if (intent === 'crew') headline = pos === 'inside'
    ? `${fmt(result.pay, currency)} a month sits inside the range (${rangeText}).`
    : `${fmt(result.pay, currency)} a month sits ${fmt(gap, currency)} ${pos} the range (${rangeText}).`;
  else headline = pos === 'inside'
    ? `An offer of ${fmt(result.pay, currency)} a month sits inside the range (${rangeText}).`
    : `An offer of ${fmt(result.pay, currency)} a month sits ${fmt(gap, currency)} ${pos} the range (${rangeText}).`;

  const moves: string[] = intent === 'hiring'
    ? pos === 'below'
      ? ['Offers under the range usually mean a smaller pool to pick from. Check the gap is worth it.', 'Rotation, leave and the program sell a job as much as the number. Put them in the ad.', 'Need the role filled? We place crew we know well. No fee unless you hire.']
      : ['You are in the market. Rotation, leave and the program are what separate your ad from the next one.', 'Be clear on start date, contract type and season plans up front. Good crew skip vague ads.', 'Need the role filled? We place crew we know well. No fee unless you hire.']
    : pos === 'below'
      ? [`That is ${fmt(gap * 12, currency)} a year. Take the range to your next review, not a feeling.`, 'Ask about rotation and leave in the same conversation. They are worth as much as the number.', 'If the boat will not move, the market will. That is what the free call with Hugo is for.']
      : pos === 'above'
        ? ['You are paid well for the role. Protect it: rotation, leave and a contract that holds it.', 'The next real jump is the next role up, not another raise in this one.', 'Want to plan that step? Book a free call with Hugo.']
        : pos === 'inside'
          ? ['You are paid in range. The next jump comes from the role, not the raise: the ticket or step up that moves you a band.', 'Rotation and leave are worth negotiating as hard as salary.', 'Want a plan for the next band? Book a free call with Hugo.']
          : ['Add your monthly pay to see exactly where you sit.', 'Rotation and leave are worth negotiating as hard as salary.', 'Want a plan for the next band? Book a free call with Hugo.'];

  return (
    <div className="mt-6 space-y-5">
      <div className={`rounded-[1.5rem] border p-5 ${pos === 'below' ? 'border-orange-400/30 bg-orange-500/10' : 'border-white/10 bg-slate-950/40'}`}>
        <p className="text-lg font-semibold leading-7 text-white sm:text-xl">{headline}</p>
        {intent === 'crew' ? (
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {b && b.n >= 5 && b.median
              ? `${b.n} crew in this bracket have shared their pay: the middle half earn ${fmt(toDisplay(b.p25 ?? b.median, currency), currency)} to ${fmt(toDisplay(b.p75 ?? b.median, currency), currency)}, median ${fmt(toDisplay(b.median, currency), currency)}.`
              : result.pay !== null
                ? `You are one of ${Math.max(b?.n ?? 1, 1)} crew to share pay for this bracket. Crew numbers show once 5 have shared.`
                : 'Crew numbers for this bracket show once 5 crew have shared their pay.'}
          </p>
        ) : null}
      </div>
      <ol className="space-y-3 text-sm leading-6 text-slate-300">
        {moves.map((m, i) => (
          <li key={m} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-white">{i + 1}</span>
            {m}
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {intent === 'crew' ? (
          <a
            href={props.bookCallUrl(`paycheck_${pos ?? 'nopay'}`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('book_call_cta_clicked', { placement: `paycheck_${pos ?? 'nopay'}` })}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F74A1C] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#FF5A2C]"
          >
            Book a free call with Hugo →
          </a>
        ) : (
          <p className="text-sm font-medium text-white">Thanks. We will get in touch about the role.</p>
        )}
        <button type="button" onClick={props.onAgain} className="text-sm text-slate-300 underline underline-offset-4 transition hover:text-white">
          Check another role
        </button>
      </div>
    </div>
  );
}
