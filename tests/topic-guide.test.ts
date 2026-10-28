import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getTopic,topics} from '../lib/graph';
import {topicGuide} from '../lib/topic-guide';

test('the learner guide presents the scoped teaching profile for enriched original topics',()=>{
 const topic=getTopic('mt_mB7DVai-Uf')!;
 assert.ok(topic.evidence.some(e=>/eye contact/i.test(e)),'original evidence is retained as source data');
 const guide=topicGuide(topic);
 assert.deepEqual(guide.evidence,topic.teaching!.understanding_evidence);
 assert.equal(guide.question,topic.teaching!.diagnostic_questions[0].question);
 assert.equal(guide.description,topic.teaching!.description);
 assert.equal(guide.domain,'Oral Language');
 assert.ok(guide.evidence.every(e=>!/eye contact/i.test(e)),'original evidence must not be presented as the scoped NZ guide');
});

test('the selected year never promotes a diagnostic from a different year scope',()=>{
 const topic=getTopic('mt_oIzycTBeE4')!;
 const year4=topicGuide(topic,4),year5=topicGuide(topic,5);
 assert.ok(year4.question&&year4.questionYears.includes(4));
 assert.equal(year5.question,null);
 assert.deepEqual(year5.questionYears,[]);
 assert.ok(topicGuide(topic).question,'a diagnostic with an explicit scope is available without a year filter');
});

test('topics without a teaching profile retain the original guide',()=>{
 const topic=topics.find(t=>!t.teaching&&t.evidence.length)!;assert.ok(topic);
 const guide=topicGuide(topic);
 assert.equal(guide.question,topic.assessmentPrompt);
 assert.deepEqual(guide.evidence,topic.evidence);
 assert.equal(guide.description,topic.description);
 assert.equal(guide.domain,topic.domain);
});
