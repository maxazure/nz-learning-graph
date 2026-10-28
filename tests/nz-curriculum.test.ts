import {test} from 'node:test';
import assert from 'node:assert/strict';
import {curriculumPackages,nzCurriculumEdges,nzCurriculumContext,nzCurriculumSources} from '../lib/nz-curriculum';
import {topics,dependencies,getTopic,prerequisites,yearsForTopic,searchTopics} from '../lib/graph';
import original from '../data/topics.json';

const expectedSubjects=['English','Science','Social Sciences','The Arts','Health and Physical Education','Technology','Learning Languages'];
const strands:Record<string,Record<number,string[]>>={
 English:{1:['Oral Language','Reading','Writing'],2:['Oral Language','Reading','Writing'],3:['Oral Language','Reading','Writing'],4:['Text Studies','Language Studies']},
 Science:{1:['Physical Science','Biological Science'],2:['Physical Science','Biological Science'],3:['Physical Science','Biological Science'],4:['Physical Science','Biological Science']},
 'Social Sciences':Object.fromEntries([1,2,3,4].map(n=>[n,['Civics and Society','History','Geography','Financial and Economic Activity']])),
 'The Arts':Object.fromEntries([1,2,3,4].map(n=>[n,['Dance','Drama','Music','Visual Arts']])),
 'Health and Physical Education':Object.fromEntries([1,2,3,4].map(n=>[n,['Health','Physical Education']])),
 Technology:{1:['Design, Make, and Innovate'],2:['Design, Make, and Innovate'],3:['Design, Make, and Innovate','Materials Technology (Resistant and Textiles)','Food and Processing Technology','Systems and Control','Digital Technology'],4:['Design, Make, and Innovate','Materials Technology (Resistant and Textiles)','Food and Processing Technology','Systems and Control','Digital Technology','Spatial and Product Design']},
};

test('all curriculum learning areas have traceable topics and phase coverage',()=>{
 assert.deepEqual(curriculumPackages.map(p=>p.subject).sort(),[...expectedSubjects].sort());
 const ids=new Set<string>(),sources=new Set(nzCurriculumSources.map(s=>s.id));
 assert.equal(sources.size,nzCurriculumSources.length,'source IDs are unique');
 for(const p of curriculumPackages){
  assert.ok(p.topics.length>0,`${p.subject} has no curated topics`);
  assert.ok(p.sources.length>0,`${p.subject} has no source`);
  assert.ok(p.limitations.length>0,`${p.subject} has no limitations`);
  const packageIds=new Set(p.topics.map(t=>t.id));
  for(const t of p.topics){
   assert.ok(!ids.has(t.id),`duplicate curated topic: ${t.id}`);ids.add(t.id);
   assert.ok(getTopic(t.id),`missing runtime topic ${t.id}`);
   assert.equal(getTopic(t.id)?.subject,p.subject,`${t.id}: topic must appear under its curriculum learning area`);
   assert.ok(sources.has(t.sourceId),`unresolved source for ${t.id}`);
   assert.ok(t.name&&t.description&&t.locator&&t.question&&t.answer&&t.explanation&&t.activity,`incomplete topic ${t.id}`);
   assert.ok(t.objectives.length&&t.evidence.length&&t.misconceptions.length&&t.hints.length>=2,`incomplete teaching profile ${t.id}`);
   assert.ok(t.years.every(y=>Number.isInteger(y)&&y>=0&&y<=10),`invalid year in ${t.id}`);
   assert.deepEqual(yearsForTopic(getTopic(t.id)!),t.years,`year mismatch for ${t.id}`);
   assert.ok(p.coverage.some(c=>c.topicIds.includes(t.id)),`no coverage entry for ${t.id}`);
   assert.equal(nzCurriculumContext(t.id)?.mappings[0].source_ids[0],t.sourceId);
  }
  for(const c of p.coverage){
   assert.ok(sources.has(c.sourceId),`unresolved coverage source for ${p.subject}`);
   assert.ok(c.topicIds.length,`empty coverage cell for ${p.subject}: ${c.phase} ${c.strand}`);
   assert.ok(c.topicIds.every(id=>packageIds.has(id)),`coverage contains unknown ID for ${p.subject}`);
  }
  if(p.subject==='Learning Languages'){
   for(const stage of [1,2,3])for(const strand of ['Linguistic Knowledge','Cultural and Sociolinguistic Knowledge'])assert.ok(p.coverage.some(c=>c.phase.startsWith(`Novice ${stage}`)&&c.strand===strand),`${p.subject} lacks Novice ${stage}: ${strand}`);
   for(const source of p.sources.filter(s=>s.id!=='nzc_languages_2026')){
    assert.ok(source.documentUrl,`${source.id} has no teaching-sequence link`);
    for(const stage of [1,2,3])assert.ok(p.topics.some(t=>t.sourceId===source.id&&t.phase.startsWith(`Novice ${stage}`)),`${source.id} lacks a Novice ${stage} example`);
   }
  }else for(const [phase,domains] of Object.entries(strands[p.subject]))for(const domain of domains){
   assert.ok(p.coverage.some(c=>c.phase.startsWith(`Phase ${phase} `)&&c.strand===domain),`${p.subject} lacks Phase ${phase}: ${domain}`);
  }
 }
});

test('suggested cross-subject connections have resolved endpoints and evidence',()=>{
 const active=new Set(topics.map(t=>t.id));
 const connected=new Set(dependencies.flatMap(edge=>[edge.topicId,edge.prerequisiteId]));
 for(const topic of curriculumPackages.flatMap(p=>p.topics))assert.ok(connected.has(topic.id),`Curriculum topic is isolated from the star map: ${topic.id}`);
 for(const edge of nzCurriculumEdges){
  assert.ok(active.has(edge.topicId),edge.topicId);assert.ok(active.has(edge.prerequisiteId),edge.prerequisiteId);
  assert.notEqual(edge.topicId,edge.prerequisiteId);assert.ok(edge.reason);assert.ok(edge.source_ids.length);
  assert.ok(edge.source_ids.every(id=>nzCurriculumSources.some(s=>s.id===id)),edge.source_ids.join(','));
  const before=yearsForTopic(getTopic(edge.prerequisiteId)!),after=yearsForTopic(getTopic(edge.topicId)!);
  if(before.length&&after.length)assert.ok(Math.min(...before)<=Math.max(...after),`Suggested link points backwards across non-overlapping year bands: ${edge.prerequisiteId} → ${edge.topicId}`);
 }
 const lang=getTopic('nzc_lang_clarify')!;
 assert.equal(lang.subject,'Learning Languages');
 assert.ok(prerequisites(lang.id).some(e=>e.topic.subject==='English'&&e.strength==='helpful'));
 assert.ok(dependencies.some(d=>getTopic(d.topicId)?.subject!==getTopic(d.prerequisiteId)?.subject));
 assert.ok(searchTopics('clarification','Learning Languages').some(t=>t.id===lang.id));
 assert.deepEqual(yearsForTopic(lang),[],'language proficiency must not be converted into a school year');
 for(const topic of curriculumPackages.find(p=>p.subject==='Learning Languages')!.topics.filter(t=>/editorial placement|not yet checked against language-specific/i.test(t.locator))){
  assert.match(nzCurriculumContext(topic.id)!.mappings[0].notes,/not been checked against the language-specific teaching sequence/);
 }
 assert.match(nzCurriculumContext('nzc_tokelau_intergenerational')!.mappings[0].notes,/not been checked against the language-specific teaching sequence/);
 const nzsl=curriculumPackages.find(p=>p.subject==='Learning Languages')!.sources.find(s=>s.id==='nzc_nzsl_2026')!;
 assert.ok(nzsl.documentUrl,'NZSL teaching sequence should have a direct source link');
 assert.doesNotMatch(nzCurriculumContext('nzc_nzsl_parameters')!.mappings[0].notes,/not been checked against the language-specific teaching sequence/);
});

test('enriched original topics retain their separate Marble text and scoped NZ profile',()=>{
 const originalById=new Map(original.topics.map(t=>[t.id,t]));
 for(const t of curriculumPackages.flatMap(p=>p.topics).filter(t=>originalById.has(t.id))){
  const prior=originalById.get(t.id)!,current=getTopic(t.id)!;
  assert.equal(current.name,prior.name);assert.equal(current.description,prior.description);
  assert.deepEqual(current.evidence,prior.evidence);assert.equal(current.assessmentPrompt,prior.assessmentPrompt);
  const profile=nzCurriculumContext(t.id);assert.equal(profile?.mappings[0].topic_id,t.id);
  assert.ok(current.teaching?.diagnostic_questions.some(q=>q.question===t.question));
 }
 assert.ok(searchTopics('rubber band','Science').some(t=>t.id==='nzc_sci_sound_vibration'));
 assert.ok(searchTopics('ice melts','Science').some(t=>t.id==='nzc_sci_states'));
});
