#!/usr/bin/env node
// Integrity checks for the editorial curriculum packages. Pedagogical validity
// and exact curriculum coverage require review against the cited sources.
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const names=['english','science','social','arts','health','technology','languages'];
const packages=names.map(n=>load(`data/nz-curriculum/${n}.json`));
const bridges=load('data/nz-curriculum/bridges.json');
const errors=[],check=(condition,message)=>{if(!condition)errors.push(message);};
const sources=new Set(),supplementIds=new Set(),questions=new Map();
const activeIds=new Set([...load('data/topics.json').topics,...load('data/nz-overlay.json').topics,...load('data/nz-maths/topics.json')].map(t=>t.id));
for(const p of packages){
 check(typeof p.subject==='string'&&p.subject,`Package lacks subject`);
 check(Array.isArray(p.sources)&&p.sources.length,`${p.subject}: no sources`);
 check(Array.isArray(p.topics)&&p.topics.length,`${p.subject}: no topics`);
 check(Array.isArray(p.coverage)&&p.coverage.length,`${p.subject}: no coverage records`);
 check(Array.isArray(p.limitations)&&p.limitations.length,`${p.subject}: no documented limitations`);
 for(const s of p.sources){
  check(s.id&&!sources.has(s.id),`Duplicate or missing source ID: ${s.id}`);sources.add(s.id);
  check(/^https:\/\//.test(s.url)&&!/sig=|token=|sp=rw/i.test(s.url),`${s.id}: invalid or signed URL`);
  check(!s.documentUrl||(/^https:\/\//.test(s.documentUrl)&&!/sig=|token=|sp=rw/i.test(s.documentUrl)),`${s.id}: invalid or signed document URL`);
  check(s.title&&s.status&&s.checkedAt,`${s.id}: incomplete source metadata`);
 }
 for(const t of p.topics){
  check(t.id&&!supplementIds.has(t.id),`Duplicate or missing supplement topic ID: ${t.id}`);supplementIds.add(t.id);activeIds.add(t.id);
  for(const k of ['name','domain','description','phase','sourceId','locator','question','answer','explanation','activity'])check(typeof t[k]==='string'&&t[k].trim(),`${t.id}: missing ${k}`);
  for(const k of ['objectives','evidence','misconceptions','hints'])check(Array.isArray(t[k])&&t[k].length&&(t[k].every(x=>typeof x==='string'&&x.trim())),`${t.id}: invalid ${k}`);
  check(Array.isArray(t.years)&&t.years.every(y=>Number.isInteger(y)&&y>=0&&y<=10),`${t.id}: invalid year`);
  check(Array.isArray(t.materials)&&Number.isFinite(t.minutes)&&t.minutes>0,`${t.id}: invalid activity details`);
  if(t.resources!==undefined)check(Array.isArray(t.resources)&&t.resources.every(r=>r.label&&r.attribution&&/^https:\/\//.test(r.url)&&!/sig=|token=|sp=rw/i.test(r.url)),`${t.id}: invalid activity resource`);
  check(p.coverage.some(c=>c.topicIds.includes(t.id)),`${t.id}: no coverage cell`);
  const normalized=t.question?.trim().toLowerCase();if(normalized){if(questions.has(normalized))errors.push(`${t.id}: duplicate diagnostic question from ${questions.get(normalized)}`);else questions.set(normalized,t.id);}
 }
}
for(const p of packages){
 const own=new Set(p.topics.map(t=>t.id));
 for(const t of p.topics)check(sources.has(t.sourceId),`${t.id}: unknown source ${t.sourceId}`);
 for(const c of p.coverage){check(sources.has(c.sourceId),`${p.subject}: coverage source missing`);check(c.strand&&c.phase&&c.locator&&c.status&&c.notes,`${p.subject}: incomplete coverage cell`);check(Array.isArray(c.topicIds)&&c.topicIds.length&&c.topicIds.every(id=>own.has(id)),`${p.subject}: invalid coverage topicIds`);}
}
const edges=[...packages.flatMap(p=>p.dependencies),...bridges.dependencies],pairs=new Set();
for(const e of edges){
 check(activeIds.has(e.topicId)&&activeIds.has(e.prerequisiteId),`Edge has unresolved endpoint: ${e.prerequisiteId} → ${e.topicId}`);
 check(e.topicId!==e.prerequisiteId,`Self edge: ${e.topicId}`);check(e.strength==='hard'||e.strength==='helpful',`Invalid edge strength`);
 check(typeof e.reason==='string'&&e.reason.trim()&&sources.has(e.sourceId),`Edge lacks reason/source: ${e.prerequisiteId} → ${e.topicId}`);
 const key=`${e.prerequisiteId}\0${e.topicId}`;check(!pairs.has(key),`Duplicate supplement edge: ${key}`);pairs.add(key);
}
if(errors.length){console.error(`✗ NZ curriculum: ${errors.length} problem(s):\n${errors.map(e=>`  - ${e}`).join('\n')}`);process.exit(1);}
console.log(`✓ NZ curriculum: ${supplementIds.size} scoped topics, ${edges.length} suggested links, ${sources.size} sources; structural checks passed.`);
