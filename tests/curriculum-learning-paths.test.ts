import {test} from 'node:test';
import assert from 'node:assert/strict';
import original from '../data/dependencies.json';
import {dependencies,getTopic,learningPath,sources,topics,yearsForTopic} from '../lib/graph';
import {nzCurriculumEdgeReviews} from '../lib/nz-curriculum';

test('curriculum-scope corrections preserve their evidence and apply to the live graph',()=>{
 for(const review of nzCurriculumEdgeReviews){
  const originalEdge=original.dependencies.find(e=>e.prerequisiteId===review.prerequisiteId&&e.topicId===review.topicId);
  assert.equal(originalEdge?.strength,'hard',`${review.prerequisiteId} -> ${review.topicId}: no inherited hard edge`);
  assert.ok(review.sourceIds.every(id=>sources.some(s=>s.id===id)),review.locator);
  assert.ok(!dependencies.some(e=>e.prerequisiteId===review.prerequisiteId&&e.topicId===review.topicId));
  if(review.action==='reverse_helpful'){
   const reversed=dependencies.find(e=>e.prerequisiteId===review.topicId&&e.topicId===review.prerequisiteId);
   assert.equal(reversed?.strength,'helpful');assert.equal(reversed?.confidence,'unreviewed');
   assert.ok(review.sourceIds.every(id=>reversed?.source_ids?.includes(id)));
  }
 }
});

test('earlier learning paths avoid later or broader prerequisite topics',()=>{
 const cases:[string,string[],string[]][]=[
  ['mt_1hgck6ucII',[],['mt_Z_Wu_77ybI','mt_b6kZgqolEd']],
  ['mt_wfEfQuHOG-',[],['mt_Z_Wu_77ybI']],
  ['mt_lFiDFPkVmH',['mt_q15w--Fb5H'],[]],
  ['mt_FuVEZ1Ac9s',['nzc_sci_inherited_trait_basic'],['mt_6aJUzBYGNs','mt_k1HXbEwG8f','mt_rOqo-8GeKt']],
  ['mt_1PAWhRhpdg',[],['mt_AabJisinfi']],
  ['mt_ifPDOYvUqm',[],['mt_AabJisinfi']],
  ['mt_mr_Vk7FGzK',[],['mt_s2mfRBoTal']],
 ];
 for(const [target,expected,excluded] of cases){
  const path=new Set(learningPath(target).steps.map(t=>t.id));
  for(const id of expected)assert.ok(path.has(id),`${target} should include ${id}`);
  for(const id of excluded)assert.ok(!path.has(id),`${target} should not require ${id}`);
 }
 assert.deepEqual(yearsForTopic(getTopic('mt_q15w--Fb5H')!),[4]);
});

// Search bands are editorial. This detects disjoint reversals; it cannot prove
// that a dependency is pedagogically required or that either mapping is exact.
test('required paths contain no mapped foundation entirely beyond the target year band',()=>{
 const incoming=new Map<string,string[]>();
 for(const edge of dependencies.filter(e=>e.strength==='hard'))incoming.set(edge.topicId,[...(incoming.get(edge.topicId)||[]),edge.prerequisiteId]);
 for(const topic of topics){
  const targetYears=yearsForTopic(topic);if(!targetYears.length)continue;
  const stack=[...(incoming.get(topic.id)||[])],seen=new Set<string>();
  while(stack.length){
   const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);
   const foundation=getTopic(id)!;const years=yearsForTopic(foundation);
   if(years.length)assert.ok(Math.min(...years)<=Math.max(...targetYears),`${id} (${years}) is required for ${topic.id} (${targetYears})`);
   stack.push(...(incoming.get(id)||[]));
  }
 }
});
