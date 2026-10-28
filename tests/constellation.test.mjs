import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dependencies} from '../lib/graph.ts';
import {graphIndex} from '../web/constellation.ts';

test('the map places a connection at the same or a later progression level',()=>{
 const {level}=graphIndex();
 for(const edge of dependencies){
  assert.ok(level.get(edge.prerequisiteId)<=level.get(edge.topicId),`${edge.prerequisiteId} -> ${edge.topicId}`);
 }
});
