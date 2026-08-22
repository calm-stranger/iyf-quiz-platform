const b = require('../question-banks');

const BANKS = ['utkarsh-2026-a','utkarsh-2026-a-r2','utkarsh-2026-b','utkarsh-2026-b-r2','utkarsh-2026-c','utkarsh-2026-c-r2'];
const GROUP = k => k.split('-')[2][0].toUpperCase();
const ROUND = k => k.endsWith('-r2') ? 2 : 1;

const STOP = new Set(['the','a','an','of','to','in','on','was','were','is','are','did','do','does','who','what','which','why','how','and','or','his','her','him','he','she','they','them','for','with','by','at','from','that','this','these','those','it','its','as','be','been','not','no','lord','sri']);
const toks = s => new Set(String(s).toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w => w && !STOP.has(w)));
const jac = (a,b) => { const A=toks(a), B=toks(b); if(!A.size||!B.size) return 0;
  let inter=0; A.forEach(w=>{ if(B.has(w)) inter++; }); return inter/(A.size+B.size-inter); };

const all = [];
BANKS.forEach(k => b.getBank(k).forEach((q,i) =>
  all.push({ bank:k, group:GROUP(k), round:ROUND(k), n:i+1, q:q.question, ans:q.options[q.correct] })));

console.log(`checking ${all.length} questions across ${BANKS.length} banks\n`);

let problems = 0;
const seen = new Set();

// 1. Exact duplicates anywhere
console.log('— exact duplicate question text —');
const byText = {};
all.forEach(x => (byText[x.q] ||= []).push(x));
let exact = 0;
Object.values(byText).filter(v => v.length > 1).forEach(v => {
  exact++;
  const sameGroup = new Set(v.map(x=>x.group)).size === 1;
  console.log((sameGroup ? '  PROBLEM ' : '  (cross-group, ok) ') + v.map(x=>`${x.group}R${x.round}Q${x.n}`).join(' = '));
  console.log('     ' + v[0].q.slice(0,80));
  if (sameGroup) problems++;
});
if (!exact) console.log('  none');

// 2. Near-duplicates WITHIN a group (the ones that matter)
console.log('\n— near-duplicates within the same group —');
let near = 0;
for (let i=0;i<all.length;i++) for (let j=i+1;j<all.length;j++) {
  const x=all[i], y=all[j];
  if (x.group !== y.group) continue;
  if (x.q === y.q) continue;               // already reported above
  const s = jac(x.q, y.q);
  const sameAns = x.ans === y.ans;
  if (s >= 0.45 || (sameAns && s >= 0.25)) {
    near++; problems++;
    console.log(`  ${x.group}R${x.round}Q${x.n}  vs  ${y.group}R${y.round}Q${y.n}   similarity ${(s*100).toFixed(0)}%${sameAns?'  SAME ANSWER':''}`);
    console.log('     ' + x.q.slice(0,78));
    console.log('     ' + y.q.slice(0,78));
  }
}
if (!near) console.log('  none');

// 3. Same correct answer within a group
console.log('\n— same answer used twice within one group —');
let sa = 0;
['A','B','C'].forEach(g => {
  const m = {};
  all.filter(x=>x.group===g).forEach(x => (m[x.ans] ||= []).push(x));
  Object.entries(m).filter(([,v])=>v.length>1).forEach(([ans,v]) => {
    sa++;
    console.log(`  Group ${g}: "${ans}" answers ${v.map(x=>`R${x.round}Q${x.n}`).join(', ')}`);
    v.forEach(x => console.log('       ' + x.q.slice(0,74)));
  });
});
if (!sa) console.log('  none');

console.log(`\n${problems ? problems + ' issue(s) needing a decision' : 'no within-group repeats'}`);
