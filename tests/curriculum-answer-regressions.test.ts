import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getTopic} from '../lib/graph';

const diagnostic=(id:string)=>{
 const question=getTopic(id)?.teaching?.diagnostic_questions[0];
 assert.ok(question,`Missing diagnostic: ${id}`);
 return question;
};

test('the concentration question states the conditions needed to compare solutions',()=>{
 const q=diagnostic('nzc_sci_concentration');
 assert.match(q.question,/(?:same|equal)\s+(?:final\s+)?volumes?/i);
 assert.match(q.question,/all\s+the\s+sugar\s+has\s+dissolved/i);
 assert.match(q.answer,/two teaspoons/i);
 assert.match(q.explanation,/(?:same|equal)\s+(?:final\s+)?volumes?/i);
});

test('numeric examples give answers consistent with their stated quantities',()=>{
 const speed=diagnostic('nzc_sci_speed_distance_time');
 const speedInputs=speed.question.match(/(\d+) metres in (\d+) seconds/i);
 assert.ok(speedInputs);assert.match(speed.answer,new RegExp(`\\b${Number(speedInputs[1])/Number(speedInputs[2])}\\s+metres per second\\b`,'i'));

 const interest=diagnostic('nzc_soc_saving_interest');
 const interestInputs=interest.question.match(/(\d+)% simple annual interest.*?\$(\d+).*?one year/i);
 const interestAnswer=interest.answer.match(/\$(\d+(?:\.\d+)?)/);
 assert.ok(interestInputs&&interestAnswer);
 assert.equal(Number(interestAnswer[1]),Number(interestInputs[1])*Number(interestInputs[2])/100);

 const trace=diagnostic('nzc_tech_trace_table');
 const traceInputs=trace.question.match(/starts at (\d+) and increases by (\d+) twice/i);
 assert.ok(traceInputs);assert.match(trace.answer,new RegExp(`\\b${Number(traceInputs[1])+2*Number(traceInputs[2])}\\b`));

 const threshold=diagnostic('nzc_tech_threshold_feedback');
 const thresholdInputs=threshold.question.match(/below (\d+).*?level of (\d+)/i);
 assert.ok(thresholdInputs);
 const turnsOn=Number(thresholdInputs[2])<Number(thresholdInputs[1]);
 assert.match(threshold.answer,turnsOn?/turn on/i:/turn off/i);
 assert.doesNotMatch(threshold.answer,turnsOn?/turn off|not turn on/i:/turn on|not turn off/i);
});

test('language-specific practice requires recognising the target language',()=>{
 const q=diagnostic('nzc_spanish_time_markers');
 assert.match(q.question,/ayer/i);assert.match(q.question,/este fin de semana/i);assert.match(q.answer,/ayer.*yesterday/i);
 const tokelau=diagnostic('nzc_tokelau_weather_time');
 assert.match(tokelau.question,/E ā mai te tau\?/);assert.match(tokelau.question,/Na ā mai te tau\?/);
 assert.match(tokelau.answer,/Na ā mai te tau\?.*past/i);
 const french=diagnostic('nzc_french_half_past');
 assert.match(french.question,/deux heures et demie/i);assert.match(french.answer,/2:30/);
});
