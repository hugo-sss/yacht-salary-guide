# Lighthouse Careers 2026 Salary Guide

**Source Type:** Mixed archive note  
**Primary Source Context:** Lighthouse Careers salary benchmarks already represented in the app dataset  
**Supplement Added:** User-provided 2026 ETO / AV-IT salary notes  
**Currencies Mentioned:** EUR/month in the existing benchmark dataset, USD/year in the ETO supplement  

---

## Overview

Lighthouse Careers is already one of the active benchmark sources used in this project. This archive note exists to capture a newly supplied 2026 supplement covering `ETO` and `AV/IT` compensation, because that material is richer than the app's current salary schema.

The added Lighthouse supplement includes:

- annual USD salary ranges
- experience-level segmentation
- yacht-size/system-complexity segmentation
- AV/IT and IT-infrastructure specialization premiums
- consultancy/day-rate notes

---

## Added ETO / AV-IT Notes

### Entry-Level ETO Positions (0-2 years yacht experience)

- Typical annual range on `40-60m` yachts: `USD 75,000-95,000`
- `40-50m`: `USD 75,000-85,000`
- `50-60m`: `USD 80,000-95,000`
- Charter-focused yachts: `5-10%` premium
- Private yachts: standard salary rates with stronger rotation packages

### Mid-Level ETO Positions (2-5 years experience)

- Typical annual range: `USD 100,000-130,000`
- `50-70m`: `USD 100,000-115,000`
- `70-80m`: `USD 115,000-130,000`
- Specialized `AV/IT` roles: `USD 120,000-140,000`
- Project-management responsibilities: additional `USD 10,000-15,000`

### Senior ETO Positions (5+ years experience)

- Typical annual range: `USD 150,000-200,000+`
- `70-90m`: `USD 150,000-175,000`
- `90m+`: `USD 175,000-200,000+`
- Chief ETO positions: `USD 190,000-220,000+`
- Specialized consultancy roles: `USD 200,000-250,000`
- Specialized project day rates: `USD 800-1,200/day`

---

## Yacht Size And System Complexity

These are the cleanest ranges to normalize into the app's current schema because they are already size-based:

- `40-60m`: `USD 75,000-115,000` annually
- `60-80m`: `USD 115,000-150,000` annually
- `80m+`: `USD 175,000-220,000+` annually

System complexity themes mentioned in the source:

- smaller yachts: broader mixed electrical / IT / engineering responsibilities
- large yachts: complex power, automation, AV, and communications systems
- superyachts: redundant power, advanced automation, cybersecurity, and technical-team leadership

---

## AV/IT Specialization Premium

### AV-specialized ETO rates

- Entry-level `AV/ETO`: `USD 85,000-110,000`
- Mid-level `AV/ETO`: `USD 125,000-155,000`
- Senior `AV/ETO`: `USD 175,000-225,000`
- Typical premium: `15-25%` above standard ETO rates

### IT-specialized ETO rates

- Cybersecurity, networking, satellite optimization, smart-yacht systems, and remote diagnostics command the strongest premiums
- Typical premium: `20-30%` above standard ETO rates
- Senior IT-specialized roles can reach `USD 240,000+`

---

## App-Normalization Decision

The app currently stores salary rows as:

- `position`
- `yacht size`
- `min/max salary`
- `currency`
- `source`

It does **not** yet store:

- experience level
- specialization premium
- charter/private modifiers
- leave structure
- consultancy day rates

Because of that, the most defensible rows to import from this Lighthouse supplement are the broader size-based ETO ranges converted from annual USD into monthly USD:

- `40-60m`: `USD 6,250-9,583/month`
- `60-80m`: `USD 9,583-12,500/month`
- `80m+`: `USD 14,583-18,333/month`

The richer AV/IT premium detail is preserved here in the archive for future schema expansion.

---

## Status

- Archived in research
- Processed into import-ready benchmark rows
- Richer experience/premium notes preserved for future app upgrades
