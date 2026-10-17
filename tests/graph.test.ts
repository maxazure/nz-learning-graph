import {test} from 'node:test';
import assert from 'node:assert/strict';
import {topics,dependencies,getTopic,learningPath,frontier,searchTopics} from '../lib/graph';
test('all topics and edges are valid and DAG is preserved',()=>{
 const ids=new Set(topics.map(t=>t.id));assert.equal(ids.size,topics.length);
 const indegree=new Map(topics.map(t=>[t.id,0]));
 const outgoing=new Map<string,string[]>();
 for(const d of dependencies){assert.ok(ids.has(d.topicId)&&ids.has(d.prerequisiteId));indegree.set(d.topicId,indegree.get(d.topicId)!+1);outgoing.set(d.prerequisiteId,[...(outgoing.get(d.prerequisiteId)||[]),d.topicId]);}
 const q=[...indegree].filter(([,n])=>n===0).map(([id])=>id);let n=0;
 while(q.length){const id=q.pop()!;n++;for(const next of outgoing.get(id)||[]){indegree.set(next,indegree.get(next)!-1);if(!indegree.get(next))q.push(next);}}
 assert.equal(n,topics.length);
});
test('learning path respects every hard prerequisite and skips known subtrees',()=>{
 const id='mt_CyV7crZ8hl';const result=learningPath(id);assert.equal(result.steps.at(-1)?.id,id);
 const order=new Map(result.steps.map((t,i)=>[t.id,i]));
 for(const d of dependencies.filter(d=>order.has(d.topicId)&&d.strength==='hard'))assert.ok(order.get(d.prerequisiteId)!<order.get(d.topicId)!);
 assert.equal(learningPath(id,[id]).steps.length,0);assert.throws(()=>learningPath('invented'));
});
test('frontier gives only currently reachable topics',()=>{
 const initial=frontier([]);assert.ok(initial.length);
 for(const t of initial)assert.equal(dependencies.filter(d=>d.topicId===t.id&&d.strength==='hard').length,0);
 assert.ok(frontier(initial.map(t=>t.id)).every(t=>!initial.some(x=>x.id===t.id)));
});
test('NZ layer carries sources and explicit review state',()=>{
 const nz=topics.filter(t=>t.nz);assert.ok(nz.length>=16);
 for(const t of nz){assert.equal(t.nz?.teacherReviewed,false);assert.ok(t.nz?.sourceIds.length);assert.ok(t.nz?.suggestedYears.length);assert.ok(getTopic(t.id));}
 assert.ok(searchTopics('coins').some(t=>t.nz));
});
