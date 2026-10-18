import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import original from '../data/topics.json';
import originalEdges from '../data/dependencies.json';
import enrichments from '../data/nz-maths/topic-enrichments.json';
import additions from '../data/nz-maths/topics.json';
import mappings from '../data/nz-maths/curriculum-mappings.json';
import supplementEdges from '../data/nz-maths/dependencies.json';
import {topics,dependencies,getTopic,learningPath,searchTopics} from '../lib/graph';
import {canonicalTopicId,mathsCuration} from '../lib/curation';
import {curriculumMappings,curriculumRequirements,curriculumStandards,mathsSources} from '../lib/maths';

test('consolidation preserves source evidence and scoped curriculum references',()=>{
 const retired=new Set(mathsCuration.merges.map(m=>m.from_id));
 assert.equal(retired.size,11);
 const raw=new Map(original.topics.map(t=>[t.id,t]));
 for(const m of mathsCuration.merges){
  assert.ok(raw.has(m.from_id)&&raw.has(m.to_id));
  assert.ok(!retired.has(m.to_id),'merge chains are not supported');
  assert.equal(getTopic(m.from_id),undefined);
  const target=getTopic(m.to_id)!;
  assert.ok(target.sourceTopicIds?.includes(m.from_id));
  for(const evidence of raw.get(m.from_id)!.evidence)assert.ok(target.evidence.includes(evidence));
  for(const standard of raw.get(m.from_id)!.standards)assert.ok(target.standards.includes(standard));
 }
 assert.equal(curriculumMappings.length,mappings.length);
 for(const m of mappings)assert.deepEqual(curriculumMappings.find(c=>c.id===m.id),{...m,topic_id:canonicalTopicId(m.topic_id)});
 const refs=[...curriculumMappings.map(m=>m.topic_id),...curriculumStandards.flatMap(s=>s.topic_ids),...curriculumRequirements.flatMap(r=>[...r.topic_ids,...(r.components||[]).flatMap(c=>[...c.topic_ids,...c.same_stage_mapped_topic_ids,...c.supporting_topic_ids_without_same_stage_mapping])])];
 for(const id of refs)assert.ok(getTopic(id)&&!retired.has(id),id);
 for(const d of dependencies){assert.notEqual(d.prerequisiteId,d.topicId);assert.ok(!retired.has(d.prerequisiteId)&&!retired.has(d.topicId));}
});

test('every original diagnostic, hint and applicability survives curation',()=>{
 for(const t of [...enrichments,...additions]){
  const current=getTopic(t.id)!.teaching!;
  for(const q of t.diagnostic_questions)assert.ok(current.diagnostic_questions.some(c=>JSON.stringify(c)===JSON.stringify(q)),t.id);
  assert.deepEqual(current.curriculum_mapping_ids,curriculumMappings.filter(m=>m.topic_id===t.id).map(m=>m.id));
 }
 assert.equal(topics.flatMap(t=>t.teaching?.diagnostic_questions||[]).length,458);
 const scale=getTopic('mt_t0g2SlP404')!.teaching!;
 assert.match(scale.diagnostic_questions[0].question,/impossible/);
 assert.match(getTopic('mt_XfyqXLqzpx')!.description,/every possibility/);
 assert.match(getTopic('mt_oqziWKry-L')!.description,/vertically opposite/);
});

test('different learning objectives have distinguishable names and remain separate',()=>{
 const maths=topics.filter(t=>t.subject==='Mathematics');
 const names=maths.map(t=>t.name.toLowerCase().replace(/\s*\(age [^)]*\)/g,''));
 assert.equal(new Set(names).size,names.length,'duplicate maths headings still obscure distinct scopes');
 for(const ids of [['mt_FbDKeLfBCo','mt_Kr3IyA6m-O','mt_Ep7TDFuYUa','mt_ebPelt-qAl'],['mt_BdAeZJUOir','mt_8atyuvPUZc'],['mt_Yw27nweoTj','mt_GZuoYaDdWd','nzm_graphical_equation_solutions']])assert.equal(new Set(ids.map(id=>getTopic(id)?.name)).size,ids.length);
 assert.ok(searchTopics('Coordinate Transformations').some(t=>t.id==='mt_SH7QgFl8-v'),'original wording remains searchable');
 assert.match(getTopic('mt_doX1BhmFgk')!.name,/Hundredths/);
 assert.match(getTopic('mt_167X6Ax8P7')!.name,/congruence/);
});

test('introductory paths do not require their later applications or broader methods',()=>{
 const cases:[string,string[]][]=[
  ['mt_hRZyKvz1KN',['mt_SH7QgFl8-v','mt_lxaM6iVpdr','mt_hVpGOEz2kG']],
  ['mt_hR2Y7NhMSY',['mt_SH7QgFl8-v']],
  ['mt_lxaM6iVpdr',['mt_SH7QgFl8-v']],
  ['mt_XWSGuFW7It',['mt_FnUJMXPUZX','mt_FspV_imUGK','mt_5mIcmKRCgA']],
  ['mt_Cg8VPguS_V',['mt_lU-2aTRB9f','mt_JH_6RpNWjr']],
  ['mt_sHJqh6UUya',['mt_-bMnJcPJy8']],
  ['mt_BdAeZJUOir',['mt_8atyuvPUZc']],
  ['mt_t0g2SlP404',['mt_Zt30Gxi-qp','mt_ZM9mhHsyYZ']],
  ['mt_FbDKeLfBCo',['mt_Ep7TDFuYUa','mt_ebPelt-qAl']],
  ['nzm_graphical_equation_solutions',['mt_GZuoYaDdWd','mt_WBdHkc2HTf','mt_-3udyo6VyB']],
  ['nzm_whole_from_fractional_part',['mt_3y7xKP9MjU']],
 ];
 for(const [id,unnecessary] of cases){const path=new Set(learningPath(id).steps.map(t=>t.id));for(const other of unnecessary)assert.ok(!path.has(other),`${other} still blocks ${id}`);}
 for(const [id,needed] of [['mt_BdAeZJUOir','mt_hVpGOEz2kG'],['mt_sHJqh6UUya','mt_LpSuPgL31x'],['mt_XWSGuFW7It','mt_PZ909yPrEC'],['nzm_graphical_equation_solutions','mt_Yw27nweoTj']])assert.ok(learningPath(id).steps.some(t=>t.id===needed));
});

test('all merge strength conflicts have explicit editorial decisions, with valid sources',()=>{
 const originals=new Map([...originalEdges.dependencies.map(d=>({...d,strength:d.strength==='soft'?'helpful':d.strength})),...supplementEdges.map(d=>({...d,topicId:d.topic_id,prerequisiteId:d.prerequisite_id}))].map(d=>[`${d.prerequisiteId}:${d.topicId}`,d]));
 const pairs=new Map<string,Set<string>>();
 for(const d of originals.values()){
  const key=`${canonicalTopicId(d.prerequisiteId)}:${canonicalTopicId(d.topicId)}`;
  pairs.set(key,new Set([...(pairs.get(key)||[]),d.strength]));
 }
 const decisions=new Set(mathsCuration.dependency_edits.map(d=>`${d.prerequisite_id}:${d.topic_id}`));
 assert.equal(decisions.size,mathsCuration.dependency_edits.length);
 for(const [key,strengths] of pairs)if(strengths.size>1)assert.ok(decisions.has(key),key);
 for(const d of mathsCuration.dependency_edits){
  assert.ok(getTopic(d.prerequisite_id)&&getTopic(d.topic_id));
  if(d.action==='remove')assert.ok(pairs.has(`${d.prerequisite_id}:${d.topic_id}`),'removal must name a real inherited edge');
  assert.equal(d.basis,'pedagogical_inference');assert.ok(d.reason&&d.source_locators.length);
  for(const id of d.source_ids)assert.ok(mathsSources.some(s=>s.id===id));
  for(const locator of d.source_locators)assert.ok(d.source_ids.includes(locator.source_id));
 }
});

test('homepage counts match the active graph in both languages',()=>{
 const counts=[topics.length,dependencies.length].map(n=>n.toLocaleString('en-NZ'));
 for(const file of ['web/index.html','web/zh-hero.ts']){const text=readFileSync(file,'utf8');for(const count of counts)assert.ok(text.includes(count),file);}
});
