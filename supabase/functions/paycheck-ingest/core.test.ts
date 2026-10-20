import { test } from 'node:test';
import assert from 'node:assert/strict';
const assertEquals = (a: unknown, b: unknown) => assert.deepEqual(a, b);
import { cardNote, flodeskFields, flodeskSegments, helloText, parsePayCheck, payPosition } from './core.ts';

const base = { kind: 'paycheck', first_name: 'Sam', email: 'Sam@Example.com', intent: 'crew', department: 'Interior', position: 'Chief Stew', yacht_size: '51-60m', yacht_type: 'Charter', band_low: 5500, band_high: 7000 };

test('valid crew check, email lowered, example.com is a dry run', () => {
  const r = parsePayCheck({ ...base, pay: '5,000', consent: true });
  if (!r.ok) throw new Error(r.error);
  assertEquals(r.value.email, 'sam@example.com');
  assertEquals(r.value.pay_eur, 5000);
  assertEquals(r.value.test, true);
  assertEquals(r.value.consent, true);
});
test('consent must be literally true', () => {
  const r = parsePayCheck({ ...base, consent: 'yes' });
  assertEquals(r.ok && r.value.consent, false);
});
test('USD pay converts at the calculator rate', () => {
  const r = parsePayCheck({ ...base, pay: 6600, pay_currency: 'USD' });
  assertEquals(r.ok && r.value.pay_eur, 6000);
});
test('yearly pay typed by mistake is refused', () => {
  const r = parsePayCheck({ ...base, pay: 72000 });
  assertEquals(r.ok, false);
});
test('bad phone, bad size and missing name refused', () => {
  assertEquals(parsePayCheck({ ...base, phone: '07700 900123' }).ok, false);
  assertEquals(parsePayCheck({ ...base, yacht_size: '60m' }).ok, false);
  assertEquals(parsePayCheck({ ...base, first_name: ' ' }).ok, false);
  const ok = parsePayCheck({ ...base, phone: '+44 7700 900123' });
  assertEquals(ok.ok && ok.value.phone, '+447700900123');
});
test('pay position and gap', () => {
  assertEquals(payPosition(5000, 5500, 7000), { position: 'below', gap: 500 });
  assertEquals(payPosition(6000, 5500, 7000), { position: 'inside', gap: 0 });
  assertEquals(payPosition(7400, 5500, 7000), { position: 'above', gap: 400 });
  assertEquals(payPosition(null, 5500, 7000), { position: null, gap: 0 });
});
test('card notes read cleanly and carry no dashes', () => {
  const r = parsePayCheck({ ...base, pay: 5000 }); if (!r.ok) throw new Error(r.error);
  assertEquals(cardNote(r.value, 'below', 500), 'Chief Stew, 51-60m charter, paid €500/mo below the range');
  const h = parsePayCheck({ ...base, intent: 'hiring', department: 'Deck', position: 'Bosun', pay: 4000 }); if (!h.ok) throw new Error(h.error);
  assertEquals(cardNote(h.value, 'inside', 0), 'hiring Bosun, 51-60m charter, offer inside the range');
  assertEquals(/[—–]/.test(helloText(r.value)), false);
});
test('segments: crew get pay check crew plus role, captains get Captain, hirers get hiring only', () => {
  const crew = parsePayCheck(base); if (!crew.ok) throw new Error(crew.error);
  assertEquals(flodeskSegments(crew.value), ['6ad5d8d8518b9d5b85c3a577', '6550afb48c357066737371bf']);
  const capt = parsePayCheck({ ...base, department: 'Deck', position: 'Captain' }); if (!capt.ok) throw new Error(capt.error);
  assertEquals(flodeskSegments(capt.value)[1], '69f03e0eeceebd7c4860d770');
  const hire = parsePayCheck({ ...base, intent: 'hiring' }); if (!hire.ok) throw new Error(hire.error);
  assertEquals(flodeskSegments(hire.value), ['6ad5d8d8144022ac4051a077']);
});
test('flodesk fields are strings and include UTM source', () => {
  const r = parsePayCheck({ ...base, phone: '+447700900123', src: { utm_source: 'linkedin', utm_campaign: 'interior-hod' } }); if (!r.ok) throw new Error(r.error);
  assertEquals(flodeskFields(r.value, 'below'), { yachtRole: 'Chief Stew', yachtSize: '51-60m', payCheckIntent: 'crew', lastFunnel: 'Pay check', payCheckResult: 'below', phoneNumber: '+447700900123', trafficSource: 'linkedin / interior-hod' });
});
