// paycheck-ingest, the pure half: what counts as a valid pay check, where the pay sits against the range, and the
// first WhatsApp message. No imports, so it runs under `deno test` as well as inside the Supabase function.
export type Intent = 'crew' | 'hiring';
export type PayPosition = 'below' | 'inside' | 'above';
export type PayCheck = {
  first_name: string; email: string; phone: string | null; intent: Intent;
  department: string; position: string; yacht_size: string; yacht_type: string | null;
  band_low: number; band_high: number;          // the guide's monthly range for this role, in EUR
  pay_eur: number | null;                       // crew: what they earn now; hiring: what they plan to offer. Monthly, EUR.
  consent: boolean;                             // ticked the separate "send me crew career emails" box
  src: Record<string, string>; page: string | null; test: boolean;
};

export const DEPARTMENTS = ['Deck', 'Engineering', 'Interior', 'Galley'];
export const SIZES = ['Below 27m', '27-30m', '31-40m', '41-50m', '51-60m', '61-70m', '70-90m', '90-100m', '100m+'];
export const USD_PER_EUR = 1.1;   // the same rate the calculator shows, so the answer matches the screen

export const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const money = (v: unknown) => { const n = Number(String(v ?? '').replace(/[^\d.]/g, '')); return Number.isFinite(n) && n > 0 ? Math.round(n) : null; };

export function parsePayCheck(raw: Record<string, unknown>): { ok: true; value: PayCheck } | { ok: false; error: string } {
  if (raw.kind !== 'paycheck') return { ok: false, error: 'unknown kind' };
  const first_name = clean(raw.first_name, 80);
  const email = clean(raw.email, 254).toLowerCase();
  if (!first_name) return { ok: false, error: 'first name missing' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: 'email not valid' };
  const phoneRaw = clean(raw.phone, 24).replace(/[\s()-]/g, '');
  if (phoneRaw && !/^\+\d{8,15}$/.test(phoneRaw)) return { ok: false, error: 'WhatsApp number needs the country code, like +44 7700 900123' };
  const intent: Intent = raw.intent === 'hiring' ? 'hiring' : 'crew';
  const department = clean(raw.department, 20);
  if (!DEPARTMENTS.includes(department)) return { ok: false, error: 'department not valid' };
  const position = clean(raw.position, 80);
  if (!position) return { ok: false, error: 'position missing' };
  const yacht_size = clean(raw.yacht_size, 20);
  if (!SIZES.includes(yacht_size)) return { ok: false, error: 'yacht size not valid' };
  const yacht_type = ['Charter', 'Private'].includes(String(raw.yacht_type)) ? String(raw.yacht_type) : null;
  const band_low = money(raw.band_low); const band_high = money(raw.band_high);
  if (!band_low || !band_high || band_low > band_high || band_low < 500 || band_high > 60000) return { ok: false, error: 'range not valid' };
  let pay_eur = money(raw.pay);
  if (pay_eur && raw.pay_currency === 'USD') pay_eur = Math.round(pay_eur / USD_PER_EUR);
  if (pay_eur !== null && (pay_eur < 500 || pay_eur > 60000)) return { ok: false, error: 'enter your monthly pay, not yearly' };
  const src: Record<string, string> = {};
  if (raw.src && typeof raw.src === 'object') for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'referrer']) { const v = clean((raw.src as Record<string, unknown>)[k], 120); if (v) src[k] = v; }
  return { ok: true, value: { first_name, email, phone: phoneRaw || null, intent, department, position, yacht_size, yacht_type, band_low, band_high, pay_eur, consent: raw.consent === true, src, page: clean(raw.page, 160) || null, test: /@example\.(com|org|net)$/.test(email) } };
}

// Where a monthly figure sits against the range, and by how much (EUR a month, always positive).
export function payPosition(pay: number | null, low: number, high: number): { position: PayPosition | null; gap: number } {
  if (pay === null) return { position: null, gap: 0 };
  if (pay < low) return { position: 'below', gap: low - pay };
  if (pay > high) return { position: 'above', gap: pay - high };
  return { position: 'inside', gap: 0 };
}

// One line for Hugo's card: who, what, and the hook.
export function cardNote(p: PayCheck, pos: PayPosition | null, gap: number): string {
  const role = `${p.position}, ${p.yacht_size}${p.yacht_type ? ` ${p.yacht_type.toLowerCase()}` : ''}`;
  if (p.intent === 'hiring') {
    const offer = pos ? `, offer ${pos === 'inside' ? 'inside' : `€${gap.toLocaleString('en-US')}/mo ${pos}`} the range` : '';
    return `hiring ${role}${offer}`;
  }
  const where = pos ? (pos === 'inside' ? 'paid inside the range' : `paid €${gap.toLocaleString('en-US')}/mo ${pos} the range`) : 'did not share pay';
  return `${role}, ${where}`;
}

// The first WhatsApp message Hugo sends a crew sign-up. It opens pre-filled; he can change it before sending.
export function helloText(p: PayCheck): string {
  return `Hey ${p.first_name}! Hugo here from Superyacht Sunday School 👋 saw you just ran the pay check for ${p.position} on a ${p.yacht_size}. Quick one so I point you the right way: are you happy where you are, or looking at your next boat?`;
}

// Flodesk custom fields (keys as Flodesk stores them). Values are always strings.
export function flodeskFields(p: PayCheck, pos: PayPosition | null): Record<string, string> {
  const f: Record<string, string> = { yachtRole: p.position, yachtSize: p.yacht_size, payCheckIntent: p.intent, lastFunnel: 'Pay check' };
  if (pos) f.payCheckResult = pos;
  if (p.phone) f.phoneNumber = p.phone;
  const source = [p.src.utm_source, p.src.utm_medium, p.src.utm_campaign].filter(Boolean).join(' / ');
  if (source) f.trafficSource = source.slice(0, 120);
  return f;
}

// Which Flodesk segments a sign-up joins: the pay check list for their intent, plus their department's Role list
// (crew only: a captain hiring a chief stew is not interior crew).
export const ROLE_SEGMENTS: Record<string, string> = {
  Deck: '6550afaa8c35701b37737190', Interior: '6550afb48c357066737371bf', Engineering: '6550afcd5ccb82c0860ba0ef', Galley: '6550afbe8962caf4b1c3f95a', Captain: '69f03e0eeceebd7c4860d770',
};
export const PAYCHECK_SEGMENTS: Record<Intent, string> = { crew: '6ad5d8d8518b9d5b85c3a577', hiring: '6ad5d8d8144022ac4051a077' };
export function flodeskSegments(p: PayCheck): string[] {
  const out = [PAYCHECK_SEGMENTS[p.intent]];
  if (p.intent === 'crew') out.push(/captain/i.test(p.position) ? ROLE_SEGMENTS.Captain : ROLE_SEGMENTS[p.department]);
  return out.filter(Boolean);
}
