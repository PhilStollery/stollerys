#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.resolve(process.cwd(), 'blog');

function hasTruncate(text) {
  return /<!--\s*truncate\s*-->/.test(text) || /\{\/\*\s*truncate\s*\*\/\}/.test(text);
}

function insertTruncate(text) {
  const fmEndIdx = text.indexOf('\n---');
  const contentStart = fmEndIdx !== -1 ? fmEndIdx + 4 : 0;
  const head = text.slice(0, contentStart);
  const body = text.slice(contentStart);

  // Find first blank line after a non-empty line to insert marker
  const lines = body.split(/\r?\n/);
  let firstParaEnd = -1;
  let seenText = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!seenText && line.trim().length > 0) {
      seenText = true;
    } else if (seenText && line.trim().length === 0) {
      firstParaEnd = i; // insert before this blank line
      break;
    }
  }
  if (firstParaEnd === -1) {
    // No blank line found; append marker after first line
    lines.splice(1, 0, '<!-- truncate -->');
  } else {
    lines.splice(firstParaEnd, 0, '<!-- truncate -->');
  }
  return head + lines.join('\n');
}

function processFile(p) {
  const text = fs.readFileSync(p, 'utf8');
  if (hasTruncate(text)) return false;
  const updated = insertTruncate(text);
  if (updated !== text) {
    fs.writeFileSync(p, updated, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const entries = fs.readdirSync(BLOG_DIR);
  let changed = 0;
  for (const name of entries) {
    if (!name.endsWith('.md') && !name.endsWith('.mdx')) continue;
    const p = path.join(BLOG_DIR, name);
    if (processFile(p)) changed++;
  }
  console.log(`Inserted truncation markers in ${changed} file(s).`);
}

main();
