const sampleCsv = `submission_id,submitted_at,respondent_age,community,consent
FD-1001,2026-09-14T09:12:00,32,Aliade,yes
FD-1002,2026-09-14T09:45:00,19,Agagbe,yes
FD-1003,2026-09-14T10:03:00,,Aliade,yes
FD-1004,2026-09-14T10:21:00,136,Ugba,no
FD-1002,2026-09-14T10:44:00,24,Agagbe,yes
FD-1006,not-a-date,41,,maybe
FD-1007,2026-09-14T11:30:00,27,Aliade,no
FD-1008,2026-09-14T11:52:00,0,Ugba,yes`;

const els = {
  file: document.querySelector('#csv-file'),
  fileName: document.querySelector('#file-name'),
  sample: document.querySelector('#load-sample'),
  downloadSample: document.querySelector('#download-sample'),
  exportClean: document.querySelector('#export-clean'),
  notice: document.querySelector('#notice'),
  caption: document.querySelector('#dataset-caption'),
  total: document.querySelector('#metric-total'),
  issues: document.querySelector('#metric-issues'),
  clean: document.querySelector('#metric-clean'),
  rate: document.querySelector('#metric-rate'),
  body: document.querySelector('#records-body'),
  filter: document.querySelector('#filter'),
  search: document.querySelector('#search'),
  rowsCount: document.querySelector('#rows-count'),
  empty: document.querySelector('#empty-state'),
};

let currentRows = [];
let currentHeaders = [];
let hasUserFile = false;

function parseCsv(source) {
  const text = source.replace(/^\uFEFF/, '');
  const matrix = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field.length === 0) {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== '')) matrix.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (inQuotes) throw new Error('This CSV has an unclosed quoted field. Check the file and try again.');
  row.push(field);
  if (row.some((value) => value.trim() !== '')) matrix.push(row);
  if (matrix.length < 2) throw new Error('Add a header row and at least one data row to the CSV.');

  const headers = matrix[0].map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error('Every CSV column needs a header.');
  const normalizedHeaders = headers.map(normalizeHeader);
  if (new Set(normalizedHeaders).size !== normalizedHeaders.length) throw new Error('This CSV has duplicate column headers. Rename the duplicates and try again.');

  const rows = matrix.slice(1).map((values, rowIndex) => {
    if (values.length > headers.length) throw new Error(`Row ${rowIndex + 2} has more values than the header row.`);
    return Object.fromEntries(headers.map((header, index) => [header, (values[index] || '').trim()]));
  });
  return { headers, rows };
}

function normalizeHeader(header) {
  return header.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

const aliases = {
  id: ['submission_id', 'record_id', 'id'],
  date: ['submitted_at', 'submitted_on', 'submission_date', 'date'],
  age: ['respondent_age', 'age_years', 'age'],
  community: ['community', 'location', 'site'],
  consent: ['consent', 'consent_given'],
};

function valueFor(row, kind) {
  const byNormalizedName = new Map(Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]));
  const key = aliases[kind].find((name) => byNormalizedName.has(name));
  return key ? byNormalizedName.get(key) : '';
}

function reviewRows(rows) {
  const ids = new Map();
  rows.forEach((row, index) => {
    const id = valueFor(row, 'id').toLowerCase();
    if (id) ids.set(id, [...(ids.get(id) || []), index]);
  });
  const duplicateIndexes = new Set([...ids.values()].filter((indexes) => indexes.length > 1).flat());

  return rows.map((row, index) => {
    const issues = [];
    const id = valueFor(row, 'id');
    const date = valueFor(row, 'date');
    const age = valueFor(row, 'age');
    const community = valueFor(row, 'community');
    const consent = valueFor(row, 'consent').toLowerCase();
    if (!id) issues.push('Missing submission ID');
    if (duplicateIndexes.has(index)) issues.push('Duplicate submission ID');
    if (!date) issues.push('Missing submission date');
    else if (Number.isNaN(Date.parse(date))) issues.push('Invalid submission date');
    if (!age) issues.push('Missing respondent age');
    else if (!Number.isFinite(Number(age)) || Number(age) < 0 || Number(age) > 120) issues.push('Age must be a number from 0 to 120');
    if (!community) issues.push('Missing community');
    if (!consent) issues.push('Missing consent');
    else if (!['yes', 'no'].includes(consent)) issues.push('Consent must be yes or no');
    return { source: row, id, date, age, community, consent: valueFor(row, 'consent'), issues };
  });
}

function setNotice(message, tone = 'info') {
  els.notice.textContent = message;
  els.notice.dataset.tone = tone;
  els.notice.hidden = !message;
}

function render() {
  const reviewed = reviewRows(currentRows);
  const issueCount = reviewed.filter((item) => item.issues.length).length;
  const cleanCount = reviewed.length - issueCount;
  els.total.textContent = String(reviewed.length);
  els.issues.textContent = String(issueCount);
  els.clean.textContent = String(cleanCount);
  els.rate.textContent = reviewed.length ? `${Math.round((issueCount / reviewed.length) * 100)}%` : '0%';
  els.exportClean.disabled = cleanCount === 0;

  const query = els.search.value.trim().toLowerCase();
  const filter = els.filter.value;
  const shown = reviewed.filter((item) => {
    const matchesFilter = filter === 'all' || (filter === 'issues' && item.issues.length > 0) || (filter === 'clean' && item.issues.length === 0);
    const matchesSearch = !query || Object.values(item.source).some((value) => value.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  els.body.replaceChildren();
  shown.forEach((item) => {
    const tr = document.createElement('tr');
    const values = [item.id || '—', item.date || '—', item.age || '—', item.community || '—', item.consent || '—'];
    values.forEach((value, index) => {
      const td = document.createElement('td');
      td.textContent = value;
      if (index === 0) td.className = 'id-cell';
      if (index === 1) td.textContent = formatDate(value);
      tr.append(td);
    });
    const status = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `review-pill ${item.issues.length ? 'issue' : 'clean'}`;
    badge.textContent = item.issues.length ? `${item.issues.length} ${item.issues.length === 1 ? 'issue' : 'issues'}` : 'Ready';
    badge.title = item.issues.join('; ') || 'No issues found';
    status.append(badge);
    tr.append(status);
    const details = document.createElement('td');
    details.className = 'issue-detail';
    details.textContent = item.issues.join(' · ') || 'No issues found';
    tr.append(details);
    if (item.issues.length) tr.setAttribute('aria-label', `${item.id || 'Record'} needs attention: ${item.issues.join(', ')}`);
    els.body.append(tr);
  });

  els.rowsCount.textContent = `${shown.length} shown`;
  els.empty.hidden = shown.length > 0;
}

function formatDate(value) {
  if (!value || Number.isNaN(Date.parse(value))) return value || '—';
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function setDataset(source, fileLabel, userFile = false) {
  try {
    const result = parseCsv(source);
    const requiredGroups = Object.values(aliases);
    const normalized = result.headers.map(normalizeHeader);
    const missingGroups = requiredGroups.filter((group) => !group.some((alias) => normalized.includes(alias)));
    if (missingGroups.length) throw new Error(`Missing expected columns: ${missingGroups.map((group) => group[0]).join(', ')}.`);
    currentHeaders = result.headers;
    currentRows = result.rows;
    hasUserFile = userFile;
    els.fileName.textContent = fileLabel;
    els.caption.textContent = userFile ? 'Your CSV · processed in this browser only' : 'Synthetic practice dataset · no real respondent data';
    els.filter.value = 'all';
    els.search.value = '';
    setNotice(`${result.rows.length} records loaded. Review flagged rows before using the clean export.`, 'info');
    render();
  } catch (error) {
    setNotice(error.message || 'Could not read this file as CSV. Check its format and try again.', 'error');
  }
}

function downloadCsv(filename, headers, rows) {
  const escapeCell = (value) => {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const csv = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ''))]
    .map((values) => values.map(escapeCell).join(','))
    .join('\r\n');
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

els.sample.addEventListener('click', () => setDataset(sampleCsv, 'Synthetic sample · 8 rows'));
els.downloadSample.addEventListener('click', () => downloadCsv('fieldnote-synthetic-survey.csv', parseCsv(sampleCsv).headers, parseCsv(sampleCsv).rows));
els.file.addEventListener('change', async () => {
  const [file] = els.file.files || [];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    setNotice('This demo accepts CSV files up to 5 MB. Try a smaller export.', 'error');
    return;
  }
  try {
    setDataset(await file.text(), file.name, true);
  } catch {
    setNotice('Could not read this file. Try saving it as UTF-8 CSV and upload it again.', 'error');
  }
});
els.filter.addEventListener('change', render);
els.search.addEventListener('input', render);
els.exportClean.addEventListener('click', () => {
  const cleanRows = reviewRows(currentRows).filter((row) => row.issues.length === 0).map((row) => row.source);
  if (cleanRows.length) downloadCsv('fieldnote-clean-records.csv', currentHeaders, cleanRows);
});

setDataset(sampleCsv, 'Synthetic sample · 8 rows');

