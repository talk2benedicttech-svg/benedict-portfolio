# Fieldnote — Field Data Quality Workbench

A browser-only CSV review demo designed around common field-survey export issues. The initial sample records are fictional.

## Run locally

Open `index.html` directly or serve this folder with any static file server. No build step or external JavaScript package is required.

## Included in this first build

- Load a synthetic CSV sample or import a UTF-8 CSV file up to 5 MB.
- Check required survey fields, repeated submission IDs, parseable dates, age values from 0–120, and yes/no consent values.
- Search and filter the records, view row-level issue counts, and export records that pass every check.
- Keep file processing in the browser; no API calls or uploads are made by the demo.

## Expected columns

`submission_id`, `submitted_at`, `respondent_age`, `community`, and `consent`. A few common alternate names are accepted, such as `record_id`, `age_years`, and `location`.

## Scope and next steps

This is a portfolio prototype, not a clinical decision system or a substitute for programme data-quality procedures. Rules are intentionally visible in the interface. Next: configurable validation rules, a Kobo/ODK-style fixture, review-summary export, automated checks, and a deployed demo. Do not load real patient or respondent data into public demos.

