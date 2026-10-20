// paycheck-ingest: the "Am I paid enough?" check on the salary calculator (salary.superyachtsundayschool.app).
// Supabase project SSS_Brain (zmiikssbwzkukfqqxjew). Public endpoint, so it trusts nothing it is sent.
// Separate from lead-ingest on purpose: that one is repo-managed and runs the class page.
//
// What one pay check does:
//   1. works out where their pay (or the offer, for a hirer) sits against the guide's range, and answers at once
//   2. crew who shared pay: stores it in salary_submissions with no name on it (one row per person per bracket)
//      and returns what other crew in the bracket earn, only once 5 or more have shared
//   3. writes a `signup` row to lead_events (actor 'paycheck', lane 'lead' for crew, 'captain' for hirers)
//   4. crew with WhatsApp: adds them to today's 'ycf_hot_leads' card with a pre-filled hello for Hugo
//      hirers: adds them to today's 'needs_hugo' card so Hugo can route them to Jordan
//   5. only if they ticked the email box: creates them in Flodesk, adds the Pay check segment for their intent
//      (plus their Role segment for crew) and the custom fields. The Flodesk result is written back to the event.
// Emails ending @example.com are a dry run: everything is checked and answered, nothing is written.
//
// Secrets: FLODESK_API_KEY (shared with lead-ingest). Optional: PAYCHECK_ORIGINS (comma list), PAYCHECK_ALLOW_LOCAL='true'.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { cardNote, clean, flodeskFields, flodeskSegments, helloText, parsePayCheck, payPosition, type PayCheck } from './core.ts';

const DEFAULT_ORIGINS = ['https://salary.superyachtsundayschool.app'];
const PREVIEW_ORIGIN = /^https:\/\/yacht-salary-guide[a-z0-9-]*\.vercel\.app$/;   // Vercel previews of the calculator
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
const MAX_BODY = 4096;
const MAX_PER_IP_PER_HOUR = 12;

function allowedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  const list = (Deno.env.get('PAYCHECK_ORIGINS') || '').split(',').map((s) => s.trim()).filter(Boolean);
  if ([...DEFAULT_ORIGINS, ...list].includes(origin) || PREVIEW_ORIGIN.test(origin)) return origin;
  if (Deno.env.get('PAYCHECK_ALLOW_LOCAL') === 'true' && LOCAL_ORIGIN.test(origin)) return origin;
  return null;
}
const headers = (origin: string | null) => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': origin || DEFAULT_ORIGINS[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});
const reply = (body: unknown, status: number, origin: string | null) => new Response(JSON.stringify(body), { status, headers: headers(origin) });
const ictDay = (ms: number) => new Date(ms + 7 * 3600e3).toISOString().slice(0, 10);
const salt = () => (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').slice(-24);
async function hash(s: string, len = 16): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt()}:${s}`));
  return [...new Uint8Array(buf)].slice(0, len / 2).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function toFlodesk(p: PayCheck, pos: ReturnType<typeof payPosition>['position']): Promise<string> {
  const key = Deno.env.get('FLODESK_API_KEY'); if (!key) return 'off';
  const auth = { Authorization: `Basic ${btoa(`${key}:`)}`, 'Content-Type': 'application/json', 'User-Agent': 'SSS paycheck-ingest (salary.superyachtsundayschool.app)' };
  try {
    const a = await fetch('https://api.flodesk.com/v1/subscribers', { method: 'POST', headers: auth, body: JSON.stringify({ email: p.email, first_name: p.first_name, custom_fields: flodeskFields(p, pos) }), signal: AbortSignal.timeout(8000) });
    if (!a.ok) return `subscriber ${a.status} ${(await a.text()).slice(0, 120)}`;
    // Address the subscriber by id: Flodesk answers 404 when the @ is percent-encoded in the path.
    const sub = await a.json().catch(() => null) as { id?: string } | null;
    const b = await fetch(`https://api.flodesk.com/v1/subscribers/${sub?.id || p.email}/segments`, { method: 'POST', headers: auth, body: JSON.stringify({ segment_ids: flodeskSegments(p) }), signal: AbortSignal.timeout(8000) });
    return b.ok ? 'ok' : `segment ${b.status} ${(await b.text()).slice(0, 120)}`;
  } catch (e) { return `error ${String(e).slice(0, 80)}`; }
}

Deno.serve(async (req) => {
  const origin = allowedOrigin(req.headers.get('origin'));
  if (req.method === 'OPTIONS') return new Response(null, { status: origin ? 204 : 403, headers: headers(origin) });
  if (req.method !== 'POST') return reply({ ok: false, error: 'POST only' }, 405, origin);
  if (!origin) return reply({ ok: false, error: 'not allowed' }, 403, null);

  const text = await req.text();
  if (text.length > MAX_BODY) return reply({ ok: false, error: 'too large' }, 413, origin);
  let raw: Record<string, unknown>;
  try { raw = JSON.parse(text); } catch { return reply({ ok: false, error: 'bad request' }, 400, origin); }
  if (clean(raw.hp, 40)) return reply({ ok: true }, 200, origin);   // honeypot filled: a bot. Say thanks, store nothing.
  const parsed = parsePayCheck(raw);
  if (!parsed.ok) return reply({ ok: false, error: parsed.error }, 400, origin);
  const p = parsed.value;

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const now = Date.now(); const ip = await hash(`ip:${(req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'}`);
  const { count } = await sb.from('lead_events').select('id', { count: 'exact', head: true }).eq('actor', 'paycheck').gte('at', new Date(now - 3600e3).toISOString()).eq('payload->>ip', ip);
  if ((count ?? 0) >= MAX_PER_IP_PER_HOUR) return reply({ ok: false, error: 'too many checks, try again in an hour' }, 429, origin);

  const { position: pos, gap } = payPosition(p.pay_eur, p.band_low, p.band_high);

  // 2. crew pay, with no name on it. Hirers' offers are not pay reports and never go in here.
  if (p.intent === 'crew' && p.pay_eur !== null && !p.test) {
    const { error } = await sb.from('salary_submissions').upsert({
      submitter_hash: await hash(`email:${p.email}`), department: p.department, position: p.position, yacht_size: p.yacht_size, yacht_type: p.yacht_type,
      monthly_eur: p.pay_eur, band_low_eur: p.band_low, band_high_eur: p.band_high, pay_position: pos, updated_at: new Date(now).toISOString(),
    }, { onConflict: 'submitter_hash,position,yacht_size' });
    if (error) console.error('salary_submissions', error.message);
  }
  const { data: bracket } = await sb.rpc('paycheck_bracket_stats', { p_position: p.position, p_yacht_size: p.yacht_size });

  if (p.test) return reply({ ok: true, dry_run: true, pay_position: pos, gap_eur: gap, bracket, would: { lane: p.intent === 'hiring' ? 'captain' : 'lead', card: p.intent === 'hiring' ? 'needs_hugo' : (p.phone ? 'ycf_hot_leads' : null), note: cardNote(p, pos, gap), flodesk: p.consent ? flodeskSegments(p) : null, hello: p.intent === 'crew' && p.phone ? helloText(p) : null } }, 200, origin);

  // 3. the event. Same person, same intent, same day is one row however often they tap.
  const day = ictDay(now); const idem = `paycheck:signup:${p.email}:${p.intent}:${day}`;
  const { error } = await sb.from('lead_events').upsert({
    at: new Date(now).toISOString(), person_key: p.email, email: p.email, phone_e164: p.phone, lane: p.intent === 'hiring' ? 'captain' : 'lead', event: 'signup', channel: 'form', actor: 'paycheck', ref: `paycheck_${p.intent}`,
    payload: { first_name: p.first_name, intent: p.intent, department: p.department, position: p.position, yacht_size: p.yacht_size, yacht_type: p.yacht_type, pay_position: pos, note: cardNote(p, pos, gap), consent_email: p.consent, src: p.src, page: p.page, ip },
    idempotency_key: idem,
  }, { onConflict: 'idempotency_key', ignoreDuplicates: true });
  if (error) { console.error('lead_events insert failed', error.message); return reply({ ok: false, error: 'could not save, try again' }, 500, origin); }

  // 4 + 5 run after the reply: the visitor never waits on cards or Flodesk. The event above is already the record.
  const after = (async () => {
    try {
      const note = cardNote(p, pos, gap); const source = p.src.utm_source || p.src.ref || null;
      if (p.intent === 'crew' && p.phone) {
        const key = `paycheck:ycf_hot_leads:${day}`; const digits = p.phone.replace(/\D/g, '');
        const { data: row } = await sb.from('bot_deliverables').select('payload').eq('idempotency_key', key).maybeSingle();
        const items: Record<string, unknown>[] = Array.isArray(row?.payload?.items) ? row!.payload.items : [];
        if (!items.some((it) => String(it.phone || '').replace(/\D/g, '') === digits)) {
          items.push({ lane: pos === 'below' ? 'hot' : 'warm', name: p.first_name, phone: p.phone, email: p.email, note, wa_me: `https://wa.me/${digits}?text=${encodeURIComponent(helloText(p))}`, signed_up_at: new Date(now).toISOString(), src: source });
          await sb.from('bot_deliverables').upsert({ bot: 'paycheck', deliverable_type: 'ycf_hot_leads', for_date: day, ran_at: new Date(now).toISOString(), status: 'sent', summary: `${items.length} pay check sign-up${items.length === 1 ? '' : 's'} with WhatsApp today: ${items.slice(-6).map((i) => `${i.name} (${i.note})`).join('; ')}`, payload: { kind: 'paycheck', items }, idempotency_key: key }, { onConflict: 'idempotency_key' });
        }
      }
      if (p.intent === 'hiring') {
        const key = `paycheck:needs_hugo:${day}:hiring`;
        const { data: row } = await sb.from('bot_deliverables').select('payload').eq('idempotency_key', key).maybeSingle();
        const items: Record<string, unknown>[] = Array.isArray(row?.payload?.items) ? row!.payload.items : [];
        if (!items.some((it) => it.email === p.email)) {
          items.push({ heat: 'hot', why: 'hirer from the pay check: route to Jordan', name: p.first_name, email: p.email, phone: p.phone, text: note, link: p.phone ? `https://wa.me/${p.phone.replace(/\D/g, '')}` : `mailto:${p.email}`, lead_key: `paycheck:${p.email}`, src: source });
          await sb.from('bot_deliverables').upsert({ bot: 'paycheck', deliverable_type: 'needs_hugo', for_date: day, ran_at: new Date(now).toISOString(), status: 'sent', summary: `${items.length} hirer${items.length === 1 ? '' : 's'} from the pay check today, route to Jordan: ${items.slice(-5).map((i) => `${i.name} (${i.text})`).join('; ')}`, payload: { kind: 'paycheck_hirers', items }, idempotency_key: key }, { onConflict: 'idempotency_key' });
        }
      }
    } catch (e) { console.error('card failed', String(e)); }
    if (p.consent) {
      const flodesk = await toFlodesk(p, pos);
      if (flodesk !== 'ok') console.error('flodesk', flodesk);
      const { data: ev } = await sb.from('lead_events').select('payload').eq('idempotency_key', idem).maybeSingle();
      if (ev) await sb.from('lead_events').update({ payload: { ...ev.payload, flodesk, flodesk_at: new Date().toISOString() } }).eq('idempotency_key', idem);
    }
  })();
  const rt = (globalThis as { EdgeRuntime?: { waitUntil(p: Promise<unknown>): void } }).EdgeRuntime;
  if (rt?.waitUntil) rt.waitUntil(after); else await after;

  return reply({ ok: true, pay_position: pos, gap_eur: gap, bracket }, 200, origin);
});
