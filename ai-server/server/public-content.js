import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, "../public");
const vocabData = JSON.parse(fs.readFileSync(path.join(publicDir, "vocab-base.json"), "utf8"));
const lessonData = JSON.parse(fs.readFileSync(path.join(publicDir, "content-base.json"), "utf8"));
const STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "into", "what", "how", "does", "this", "that",
  "please", "help", "tell", "about", "explain", "translate", "word", "words", "lesson",
]);
const MAX_MATCHES = 12;
const MAX_CONTEXT_CHARS = 6_500;

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase();
}

function tokenize(value) {
  return normalize(value).match(/[\p{L}\p{N}]{2,}/gu) || [];
}

const publicRows = [];
function addRow(source, category, fields) {
  const safeFields = fields.map((field) => String(field ?? "").trim()).filter(Boolean).slice(0, 8);
  if (!safeFields.length) return;
  const searchText = normalize([category, ...safeFields].join(" "));
  publicRows.push({
    source,
    category: String(category || "").slice(0, 160),
    fields: safeFields.map((field) => field.slice(0, 1_000)),
    searchText,
    tokens: new Set(tokenize(searchText)),
  });
}

function walkVocab(value, category) {
  if (!Array.isArray(value)) return;
  if (value.length && value.every((item) => typeof item === "string")) {
    addRow("vocabulary", category, value);
    return;
  }
  for (const item of value) walkVocab(item, category);
}

for (const [category, rows] of Object.entries(vocabData.categories || {})) {
  walkVocab(rows, category);
}

for (const row of Array.isArray(lessonData.read) ? lessonData.read : []) {
  if (Array.isArray(row)) addRow("reading lesson", row[3] || "", row);
}
for (const row of Array.isArray(lessonData.dialogs) ? lessonData.dialogs : []) {
  if (Array.isArray(row)) addRow("dialogue lesson", row[0] || "", row);
}

export function getRelevantPublicContext(question) {
  const terms = [...new Set(tokenize(question))]
    .filter((term) => term.length >= 2 && !STOPWORDS.has(term))
    .slice(0, 24);
  if (!terms.length) return "";

  const matches = [];
  for (const row of publicRows) {
    let score = 0;
    for (const term of terms) {
      if (row.tokens.has(term)) score += 4;
      else if (term.length >= 4 && row.searchText.includes(term)) score += 1;
    }
    if (score) matches.push({ score, row });
  }
  matches.sort((a, b) => b.score - a.score);

  const selected = [];
  let used = 0;
  for (const { row } of matches) {
    if (selected.length >= MAX_MATCHES) break;
    const entry = { source: row.source, category: row.category, fields: row.fields };
    const encoded = JSON.stringify(entry);
    if (used + encoded.length > MAX_CONTEXT_CHARS) continue;
    selected.push(entry);
    used += encoded.length;
  }
  return selected.length ? JSON.stringify(selected) : "";
}
