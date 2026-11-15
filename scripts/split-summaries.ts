// Moves each lesson's "## Summary" section into its own file, src/content/summaries/<lesson>.mdx,
// and makes the lesson import it. The summary then has one source and is shown in two places:
// at the end of its lesson, and on the revision notes page.
//
// Run with:  bun scripts/split-summaries.ts
// Safe to run again: a lesson that already imports its summary is left alone.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const lessons = join(import.meta.dir, '..', 'src', 'content', 'lessons');
const summaries = join(import.meta.dir, '..', 'src', 'content', 'summaries');
mkdirSync(summaries, { recursive: true });

for (const name of readdirSync(lessons).filter((f) => f.endsWith('.mdx'))) {
  const id = name.replace(/\.mdx$/, '');
  const file = join(lessons, name);
  const source = readFileSync(file, 'utf8');
  if (source.includes("from '../summaries/")) {
    console.log(`${id}: already split, skipped`);
    continue;
  }
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const lines = source.split(/\r?\n/);
  const start = lines.indexOf('## Summary');
  const end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  const anchor = lines.findIndex((l) => l.startsWith('import Callout from'));
  if (start < 0 || end < 0 || anchor < 0) throw new Error(`${id}: could not find the summary section`);

  const body = lines.slice(start + 1, end);
  while (body.length && !body[0].trim()) body.shift();
  while (body.length && !body[body.length - 1].trim()) body.pop();
  const out = join(summaries, name);
  if (existsSync(out)) throw new Error(`${out} already exists`);
  writeFileSync(out, body.join('\n') + '\n');

  const next = [
    ...lines.slice(0, anchor),
    `import Summary from '../summaries/${name}';`,
    ...lines.slice(anchor, start + 1),
    '',
    '<Summary />',
    '',
    ...lines.slice(end),
  ];
  writeFileSync(file, next.join(eol));
  console.log(`${id}: ${body.length} lines moved`);
}
