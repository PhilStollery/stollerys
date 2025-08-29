#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.resolve(process.cwd(), 'blog');
const TAGS_FILE = path.join(BLOG_DIR, 'tags.yml');
const LABELS_FILE = path.join(BLOG_DIR, 'tag-labels.json');

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function yamlEscape(str) {
  return String(str).replace(/'/g, "''");
}

function readFrontMatterTags(filepath) {
  const text = fs.readFileSync(filepath, 'utf8');
  const fmStart = text.indexOf('---');
  if (fmStart !== 0) return [];
  const fmEnd = text.indexOf('\n---', 3);
  if (fmEnd === -1) return [];
  const fm = text.slice(3, fmEnd).trim();
  // crude parse: find a line starting with tags:
  const lines = fm.split(/\r?\n/);
  let tags = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^tags\s*:\s*(.*)$/i);
    if (m) {
      let rest = m[1].trim();
      if (rest.startsWith('[')) {
        // inline array possibly spanning multiple lines until ']'
        let buf = rest;
        while (!buf.includes(']') && i < lines.length - 1) {
          i++;
          buf += ' ' + lines[i].trim();
        }
        const inside = buf.replace(/^\[/, '').replace(/]$/, '');
        tags = inside
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .map(s => s.replace(/^['"]|['"]$/g, ''));
      } else if (rest === '' || rest === '|') {
        // block list like:
        // tags:
        //   - foo
        //   - bar
        i++;
        while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
          tags.push(lines[i].replace(/^\s*-\s+/, '').trim());
          i++;
        }
        i--; // step back one line for outer loop
      } else if (rest) {
        // single string or comma separated
        tags = rest
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .map(s => s.replace(/^['"]|['"]$/g, ''));
      }
      break;
    }
  }
  return tags;
}

function collectAllTags() {
  const entries = fs.readdirSync(BLOG_DIR);
  const tags = new Set();
  for (const name of entries) {
    const p = path.join(BLOG_DIR, name);
    if (!name.endsWith('.md') && !name.endsWith('.mdx')) continue;
    const t = readFrontMatterTags(p);
    t.forEach(tag => tags.add(tag));
  }
  return Array.from(tags);
}

function writeTagsYaml(entries) {
  const keys = entries.map(e => e.key).sort((a, b) => a.localeCompare(b));
  const map = new Map(entries.map(e => [e.key, e]));
  const out = keys.map(k => {
    const e = map.get(k);
    const key = `'${yamlEscape(k)}'`;
    const label = `'${yamlEscape(e.label)}'`;
    const desc = `'${yamlEscape(e.description)}'`;
    return (
      `${key}:\n` +
      `  label: ${label}\n` +
      `  permalink: /${e.slug}\n` +
      `  description: ${desc}`
    );
  }).join('\n\n') + '\n';
  fs.writeFileSync(TAGS_FILE, out, 'utf8');
}

function main() {
  const allTags = collectAllTags();
  let overrides = {};
  if (fs.existsSync(LABELS_FILE)) {
    try {
      overrides = JSON.parse(fs.readFileSync(LABELS_FILE, 'utf8')) || {};
    } catch (e) {
      console.warn(`Warning: could not parse ${LABELS_FILE}:`, e.message);
    }
  }
  const slugCounts = new Map();
  const entries = allTags.map(raw => {
    const key = String(raw).trim();
    const base = slugify(key) || key.toLowerCase();
    const count = slugCounts.get(base) || 0;
    const nextCount = count + 1;
    slugCounts.set(base, nextCount);
    const uniqueSlug = count === 0 ? base : `${base}-${nextCount}`;
    return {
      key,
      label: overrides[key] ?? key,
      slug: uniqueSlug,
      description: `${key} tag`,
    };
  });
  writeTagsYaml(entries);
  console.log(`Wrote ${entries.length} tag definitions to ${TAGS_FILE}.`);
}

main();
