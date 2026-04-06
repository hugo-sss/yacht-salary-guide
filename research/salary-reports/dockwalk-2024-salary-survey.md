# Dockwalk 2024 Salary Survey

**Source File:** `/Users/hugo-sss/Downloads/81550ca0-bc8d-11ef-b06b-613d478d1f7b-Dockwalk-Salary-Survey.pdf`  
**Source Type:** User-provided PDF  
**Edition:** Dockwalk Salary Survey 2024  
**Pages:** 4  
**Currencies:** USD/month and EUR/month  
**Methodology:** Agency range, poll average, and poll range  

---

## Overview

This is the updated Dockwalk salary survey PDF for 2024. It replaces the earlier lightweight web-note in this archive with a source-backed record based on the actual survey document.

Dockwalk describes this as its 15th annual salary poll. The survey combines crew-agency salary submissions with direct crew responses and reports the results by position and yacht-size band.

---

## Methodology Notes

From page 4 of the PDF:

- 12 crew agencies contributed salary figures for 2024
- Almost 850 captains and crew responded to the online poll
- `Agency range` = average low and high across the participating agencies
- `Poll range` = lowest and highest individual crew responses
- `Poll average` = average of all crew poll responses
- `*` indicates fewer than five responses in that position/size band
- Some cells are marked `no response` or `one response`

### Contributing Agencies

- Burgess
- Camper & Nicholsons
- Cotton Crews
- Crew Pacific
- El Crew Co
- IYC
- Monaco Equipage
- mymuybueno
- NauticALL
- Northrop & Johnson
- Saltwater Recruitment
- The Yacht Stew Academy

---

## Table Coverage

### Positions captured

- Captain
- Chief/First Officer
- Second Officer
- Bosun
- Deckhand
- Chief/Sole Engineer
- Second Engineer
- Chief/Solo Steward/ess
- Steward/ess
- Chef
- ETO
- Purser
- Sous/Crew Chef

### Size bands seen in the PDF

#### Dollars table

- 20-29 meters
- 30-39 meters
- 40-49 meters
- 50-59 meters
- 60-69 meters
- 70-79 meters
- 80-89 meters
- 90-99 meters
- 100 meters+

#### Euros table

- 20-29 metres
- 30-39 metres
- 40-49 metres
- 50-59 metres
- 60-69 metres
- 70-79 metres
- 80-89 metres
- 90-99 metres
- 100 metres+

---

## Extraction Notes

- The PDF text was extracted locally with `PDFKit` for archive purposes.
- Because this is a layout-heavy salary table, some extracted values may need visual verification before import.
- The source is still strong enough to use as the authoritative Dockwalk 2024 reference in the research archive.

### Reliable high-level examples from the PDF

#### Monthly salary in dollars

- `Captain`, `20-29 meters`: agency `6000-12500`, poll average `9,770`, poll range `2700-17000`
- `Captain`, `30-39 meters`: agency `6000-15000`, poll average `14,515`, poll range `1000-24000`
- `Captain`, `40-49 meters`: agency `8000-18000`, poll average `14,528`, poll range `10000-20000`
- `Captain`, `50-59 meters`: agency `9000-25000`, poll average `16,554`, poll range `11550-28000`
- `Captain`, `60-69 meters`: agency `12000-30000`, poll average `25,125`, poll range `15500-40000*`
- `Captain`, `70-79 meters`: agency `15000-30000`, poll average `20,000`, poll range `16000-27000`
- `Captain`, `80-89 meters`: agency `15000-35000`, poll average `24,500`, poll range `19000-29000*`

#### Monthly salary in euros

- `Captain`, `20-29 metres`: agency `4000-9000`, poll average `6,012`, poll range `2500-12000`
- `Captain`, `40-49 metres`: agency `8000-21140`, poll average `10,410`, poll range `6000-16000`
- `Captain`, `50-59 metres`: agency `10000-26250`, poll average `15,599`, poll range `10500-24000`
- `Captain`, `60-69 metres`: agency `10000-25000`, poll average `20,348`, poll range `15000-24850*`
- `Captain`, `70-79 metres`: agency `8000-22000`, poll average `19,500`, poll range `18000-21000*`
- `Captain`, `100 metres+`: agency `17000-27983`, poll average `20,833`, poll range `17000-25000*`

---

## Import Guidance

- This survey should be normalized carefully before app import because it contains three metrics per cell, not just one salary band.
- `Agency range` is the cleanest field to map into the app's current benchmark schema.
- `Poll average` and `poll range` are useful supporting data but may deserve separate fields or a future detail view instead of being flattened into the main benchmark table.

---

## Status

- Archived in research
- Source-backed from the actual 2024 PDF
- Ready for a future structured parse into import JSON
