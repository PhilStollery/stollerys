#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.resolve(process.cwd(), 'blog');
const AUTHOR_VALUE = 'pstollery';

function updateFrontMatterAuthors(text) {
  const fmMatch = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!fmMatch) {
    return `---\nauthors: ${AUTHOR_VALUE}\n---\n` + text;
  }
  const fmStart = fmMatch.index;
  const fmFull = fmMatch[0];
  const fmBody = fmMatch[1];
  const bodyStartIdx = fmStart + fmFull.length;
  const rest = text.slice(bodyStartIdx);

  const lines = fmBody.split(/\r?\n/);
  let out = [];
  let i = 0;
  let found = false;
  while (i < lines.length) {
    const line = lines[i];
    if (/^authors\s*:/i.test(line)) {
      out.push(`authors: ${AUTHOR_VALUE}`);
      found = true;
      i++;
      while (i < lines.length && /^\s/.test(lines[i])) {
        i++;
      }
      continue;
    }
    out.push(line);
    i++;
  }
  if (!found) {
    out.push(`authors: ${AUTHOR_VALUE}`);
  }
  const newFm = `---\n${out.join('\n')}\n---\n`;
  return newFm + rest;
}

function main() {
  const entries = fs.readdirSync(BLOG_DIR);
  let changed = 0;
  for (const name of entries) {
    if (!name.endsWith('.md') && !name.endsWith('.mdx')) continue;
    const p = path.join(BLOG_DIR, name);
    const text = fs.readFileSync(p, 'utf8');
    const updated = updateFrontMatterAuthors(text);
    if (updated !== text) {
      fs.writeFileSync(p, updated, 'utf8');
      changed++;
    }
  }
  console.log(`Updated authors in ${changed} file(s).`);
}

main();
