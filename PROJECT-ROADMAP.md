# Project roadmap for remote-ready portfolio work

The portfolio should show finished work with evidence. Ideas below stay off the public project grid until they are built and reviewed. The Field Data Quality Workbench is the first new project and its initial browser demo is in `projects/field-data-quality-workbench/`.

## 1. Field Data Quality Workbench — active first build

**Why it fits:** builds directly on field data collection experience and demonstrates practical JavaScript, data validation, and clear error reporting.

**Initial demo:** import a CSV, detect missing required values, duplicate submission IDs, invalid dates, out-of-range ages, and unsupported consent values; filter and search records; export rows that pass the checks. The sample data is fictional and the file is processed locally in the browser.

**Next build milestones:** add configurable schemas and column mapping; support a Kobo/ODK-style export fixture; add a review summary download; add a small documented rule engine and a few automated checks; deploy the public demo; publish source code with screenshots and setup instructions.

## 2. CrownTech Service Desk

**Why it fits:** turns hands-on business operations into a concrete full-stack project instead of another generic admin dashboard.

**Scope:** job intake for typing, design, printing, and registrations; a status board; quotes and payments recorded without connecting to a payment processor; completion notes; and simple weekly service totals. Use fictional seed records in the demo.

**Portfolio evidence:** clear workflow, role-aware screens, server-side validation, MySQL schema, and a short deployment guide. Suggested stack: React, Node.js/Express, and MySQL.

## 3. SecureVault Backup Verifier

**Why it fits:** extends the existing Python/PySide6 desktop project with an auditable safety workflow.

**Scope:** show backup history, verify file counts and checksums, flag incomplete runs, and offer a restore preview before a user chooses any restore action. Keep destructive restore steps explicit and confirmable.

**Portfolio evidence:** architecture notes, sample folder fixtures, a recovery walkthrough, and screenshots from the real application.

## 4. Ngosue School System — focused case study

The live school site is already listed as built work. A follow-on feature should be selected only after confirming what the school actually needs. Candidate areas include attendance, fee reconciliation, or report generation; do not claim any of these exist until they are implemented and accepted by the school.

## Git publication checklist

- Create one repository per substantial application, with a focused README, screenshots, and setup steps.
- Keep student, patient, client, and staff records out of public commits; use synthetic demo data.
- Add only verified frameworks and deployment details to each case study.
- The workspace now has a local Git repository. Add a remote after choosing the GitHub repository and visibility; public publication should be reviewed first because the portfolio includes a portrait, résumé, email, and phone number.

