import {mkdir,writeFile} from 'node:fs/promises';
import {topics,dependencies,sources,guidance} from '../lib/graph';
import {curriculumMappings,curriculumStandards,curriculumRequirements} from '../lib/maths';
import {mathsCuration} from '../lib/curation';

await mkdir('dist/open-data/current',{recursive:true});
for(const [name,data] of Object.entries({
 'topics':{topicCount:topics.length,topics},
 'dependencies':{edgeCount:dependencies.length,dependencies},
 'curriculum-mappings':curriculumMappings,
 'standards':curriculumStandards,
 'curriculum-requirements':curriculumRequirements,
 'sources':sources,
 'maths-curation':mathsCuration,
 'manifest':{reviewedAt:mathsCuration.reviewed_at,topicCount:topics.length,edgeCount:dependencies.length,guidance,note:'This is the active dataset used by the website and MCP. Source archives in the parent directory remain unchanged. sourceTopicIds identifies original records consolidated into a topic; these source IDs are not active aliases.',databaseLicense:'ODbL-1.0',contentLicense:'CC-BY-SA-4.0'},
}))await writeFile(`dist/open-data/current/${name}.json`,JSON.stringify(data));
console.log(`Exported current graph: ${topics.length} topics, ${dependencies.length} edges.`);
