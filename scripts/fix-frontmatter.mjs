#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const root = path.resolve(process.cwd());
const blogDir = path.join(root, 'blog');

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      yield fullPath;
    }
  }
}

function normalizeDate(value) {
  const v = value.trim().replace(/^"|"$/g, '');
  // If value already contains 'T', assume ISO-like
  if (/T/.test(v)) return v;
  // Convert 'YYYY-MM-DD HH:MM' -> 'YYYY-MM-DDTHH:MM'
  const m = v.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
  if (m) return `${m[1]}T${m[2]}`;
  return v;
}

function normalizeTagsValue(value) {
  let v = value.replace(/\n/g, ' ').trim();
  // Remove surrounding brackets if present to reformat consistently
  if (v.startsWith('[')) v = v.slice(1);
  if (v.endsWith(']')) v = v.slice(0, -1);
  // Split on commas, trim, drop empties and trailing commas
  const parts = v
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return `[${parts.join(', ')}]`;
}

async function fixFile(filePath) {
  const original = await fs.readFile(filePath, 'utf8');
  const lines = original.split(/\r?\n/);
  if (lines[0] !== '---') return false; // no front matter at start

  let fmEnd = -1;
  for (let i = 1; i < Math.min(lines.length, 50); i++) {
    if (lines[i].trim() === '---') { fmEnd = i; break; }
  }
  if (fmEnd === -1) return false;

  let changed = false;
  for (let i = 1; i < fmEnd; i++) {
    const line = lines[i];
    // Normalize Date -> date
    if (/^Date\s*:/.test(line)) {
      const val = line.split(':').slice(1).join(':');
      const norm = normalizeDate(val);
      const newLine = `date: "${norm}"`;
      if (newLine !== line) {
        lines[i] = newLine;
        changed = true;
      }
      continue;
    }
    // Normalize date format
    if (/^date\s*:/.test(line)) {
      const val = line.split(':').slice(1).join(':');
      const norm = normalizeDate(val);
      const newLine = `date: "${norm}"`;
      if (newLine !== line) {
        lines[i] = newLine;
        changed = true;
      }
      continue;
    }
    // Normalize tags
    if (/^tags\s*:/.test(line)) {
      // capture everything after the first colon (may be empty)
      let after = line.replace(/^tags\s*:/, '').trim();
      let j = i;
      if (after.startsWith('[') && !after.includes(']')) {
        // Multiline bracket array: concatenate following lines until closing ']'
        let collected = after;
        for (j = i + 1; j < fmEnd; j++) {
          collected += '\n' + lines[j].trim();
          if (collected.includes(']')) break;
        }
        after = collected;
      }
      // Normalize to single-line bracket array
      const norm = normalizeTagsValue(after);
      const newLine = `tags: ${norm}`;
      if (newLine !== line || j !== i) {
        lines[i] = newLine;
        // Remove consumed continuation lines if any
        if (j > i) {
          lines.splice(i + 1, j - i);
          fmEnd -= (j - i);
        }
        changed = true;
      }
      continue;
    }
  }

  if (changed) {
    await fs.writeFile(filePath, lines.join('\n'), 'utf8');
  }
  return changed;
}

async function main() {
  let total = 0;
  for await (const file of walk(blogDir)) {
    const changed = await fixFile(file);
    if (changed) {
      total++;
      console.log('Fixed front matter:', path.relative(root, file));
    }
  }
  console.log(`Done. Updated ${total} file(s).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
