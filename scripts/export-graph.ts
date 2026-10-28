import {mkdir,writeFile} from 'node:fs/promises';
import {topics,dependencies,sources,guidance,curriculumMappings} from '../lib/graph';
import {curriculumStandards,curriculumRequirements} from '../lib/maths';
import {curriculumPackages} from '../lib/nz-curriculum';
import {mathsCuration} from '../lib/curation';

await mkdir('dist/open-data/current',{recursive:true});
for(const [name,data] of Object.entries({
 'topics':{topicCount:topics.length,topics},
 'dependencies':{edgeCount:dependencies.length,dependencies},
 'curriculum-mappings':curriculumMappings,
 'standards':curriculumStandards,
 'curriculum-requirements':curriculumRequirements,
 'subject-coverage':curriculumPackages.map(({subject,coverage,limitations})=>({subject,coverage,limitations})),
 'sources':sources,
 'maths-curation':mathsCuration,
 'manifest':{reviewedAt:mathsCuration.reviewed_at,reviewScope:'reviewedAt records the mathematics curation date only; the broader curriculum supplement remains an unreviewed research draft.',topicCount:topics.length,edgeCount:dependencies.length,guidance,note:'This is the active dataset used by the website and MCP. Source archives in the parent directory remain unchanged. sourceTopicIds identifies original records consolidated into a topic; these source IDs are not active aliases. Curriculum-derived NZ supplement content is subject to the Ministry’s non-commercial source terms and exceptions; see sources and PROVENANCE.md.',databaseLicense:'ODbL-1.0',contentLicense:'Marble CC-BY-SA-4.0; Ministry curriculum adaptations CC-BY-NC-4.0, subject to source exceptions'},
}))await writeFile(`dist/open-data/current/${name}.json`,JSON.stringify(data));
console.log(`Exported current graph: ${topics.length} topics, ${dependencies.length} edges.`);
