# Fieldnote design context

## Audience and job

For field data collectors and programme teams who need a quick first-pass review of a survey CSV before reporting. The demo helps spot obvious row-level issues; it is not a clinical decision tool or a replacement for programme review.

## Visual identity

- **Forest ink `#102d2a` / `#123f38`:** conveys calm, operational focus and relates to the portfolio's green identity.
- **Paper `#f5f7f3`, white `#ffffff`, line `#d9e1dc`:** keep dense record tables legible.
- **Review amber `#ac552d` and pale amber `#fff0e7`:** flags require human attention; no record is silently altered.
- **Ready green `#28664d` and pale green `#eaf4eb`:** signals that a row passed the visible checks.
- **DM Sans + Manrope + DM Mono:** readable body and headings, with compact technical labels.

## Interaction rules

- Imported CSV files are parsed locally in the browser; the demo makes no network request for records.
- Never modify source rows automatically. Export only rows that pass every displayed check.
- Keep the active file, counts, and issue details visible after importing; announce status changes through the live region.
- Show a useful error for invalid CSV, missing headers, oversize files, and malformed quoted values.
- Search, filter, keyboard focus, responsive table scrolling, and reduced motion are part of the UI contract.
- All starter records are synthetic. Do not include real student, patient, respondent, or client information in a public repository or deployment.

