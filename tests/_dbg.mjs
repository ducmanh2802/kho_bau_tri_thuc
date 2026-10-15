import { readFileSync } from 'node:fs';
function stripCommentsAndStrings(source) {
  let out = '';
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === '/' && next === '/') { while (i < source.length && source[i] !== "\n") { out += ' '; i += 1; } continue; }
    if (ch === '/' && next === '*') { while (i < source.length && !(source[i] === '*' && source[i+1] === '/')) { out += source[i] === "\n" ? "\n" : ' '; i += 1; } out += '  '; i += 2; continue; }
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch; out += ' '; i += 1;
      while (i < source.length && source[i] !== quote) { out += source[i] === "\n" ? "\n" : ' '; i += 1; }
      out += ' '; i += 1; continue;
    }
    out += ch; i += 1;
  }
  return out;
}
const source = readFileSync('src/components/motivation/LevelUpCelebrationModal.tsx','utf8');
const code = stripCommentsAndStrings(source);
const arrow = /^(?:export )?const ([A-Z]\w*)[^;]*?=>\s*\{/gm;
const m = [...code.matchAll(arrow)];
console.log('code matches:', m.length, m.map(x=>x[1]));
const start = m[0];
const bodyStart = start.index + start[0].length - 1;
console.log('code bodyStart snippet:', JSON.stringify(code.slice(bodyStart-20, bodyStart+30)));
