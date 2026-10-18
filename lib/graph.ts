import {mathsProfiles,mathsAdditions,mathsDependencies,mathsSources,topicMappings,mappedYears,type TeachingProfile,type CurriculumMapping} from './maths';
export {curriculumMappings,topicMappings} from './maths';
import original from '../data/topics.json';
import relations from '../data/dependencies.json';
import overlay from '../data/nz-overlay.json';

export interface Topic {
 id:string; type:string; subject:string; domain:string; name:string; description:string;
 ageRangeStart:number|null; ageRangeEnd:number|null; centrality:number; evidence:string[]; assessmentPrompt:string; standards:string[];
 teaching?:TeachingProfile; curriculumMappings?:CurriculumMapping[]; suggestedYears?:number[];
 nz?: {suggestedYears:number[];sourceIds:string[];mappingStatus:string;teacherReviewed:boolean;localContext:string;parentActivity:string};
}
const base:Topic[] = [...original.topics,...overlay.topics];
const originalById=new Map(base.map(t=>[t.id,t]));
export function topicSearchText(t:Topic){const old=originalById.get(t.id);return `${t.name} ${t.description} ${t.domain} ${t.nz?.localContext||''} ${old?.name||''} ${old?.description||''}`.toLowerCase();}
export const topics:Topic[] = [...base,...mathsAdditions.map(t=>({id:t.id,type:t.node_type,subject:t.subject,domain:t.domain,name:t.name,description:t.description,ageRangeStart:null,ageRangeEnd:null,centrality:0,evidence:t.understanding_evidence,assessmentPrompt:t.diagnostic_questions[0].question,standards:[]}))].map(t=>{
 const teaching=mathsProfiles.get(t.id), mappings=topicMappings(t.id);
 return {...t,...(teaching?{name:teaching.name,description:teaching.description,evidence:teaching.understanding_evidence,assessmentPrompt:teaching.diagnostic_questions[0].question,teaching}:{}),...(mappings.length?{curriculumMappings:mappings,suggestedYears:mappedYears(t.id)}:{})};
});
export const sources = [...overlay.sources,...mathsSources];
export interface Dependency {topicId:string;prerequisiteId:string;strength:string;reason:string;basis?:string;confidence?:string;source_ids?:string[];source_locators?:unknown[]}
const baseline:Dependency[] = [...relations.dependencies.map(d=>({...d,strength:d.strength==='soft'?'helpful':d.strength})),...overlay.topics.flatMap(t=>t.prerequisiteIds.map(id=>({topicId:t.id,prerequisiteId:id,strength:'hard',reason:'Suggested foundation for this NZ activity.'})))];
// Supplement metadata replaces a matching endpoint pair; it is never appended twice.
const edgeMap=new Map(baseline.map(d=>[`${d.prerequisiteId}:${d.topicId}`,d]));
for(const d of mathsDependencies)edgeMap.set(`${d.prerequisiteId}:${d.topicId}`,d);
export const dependencies:Dependency[]=[...edgeMap.values()];
export function yearsForTopic(t:Topic){return t.suggestedYears||t.nz?.suggestedYears||[];}
const byId = new Map(topics.map(t=>[t.id,t]));
export const subjects = [...new Set(topics.map(t=>t.subject))].sort();
export const guidance = 'Use the learning graph to plan small steps. Check prerequisites, ask one question at a time and give hints before answers. Use the linked sources and distinguish suggested NZ years from original age ranges. A learner can also explore independently. Use diagnostic applicability and each curriculum mapping scope before choosing questions. Typical school years are not NCEA qualification levels. Research-draft pedagogy and inferred prerequisite edges are not official assessment decisions. One correct answer does not establish mastery or an NCEA grade.';
export function getTopic(id:string) {return byId.get(id);}
export function searchTopics(query='',subject?:string,limit=40):Topic[] {
 const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 return topics.filter(t=>(!subject||t.subject===subject)&&terms.every(w=>topicSearchText(t).includes(w)))
 .sort((a,b)=>Number(!!b.nz)-Number(!!a.nz)||Number(!!b.curriculumMappings)-Number(!!a.curriculumMappings)||b.centrality-a.centrality).slice(0,Math.min(100,Math.max(1,limit)));
}
export function prerequisites(id:string) {
 if(!byId.has(id)) throw new Error('Unknown topic ID');
 return dependencies.filter(d=>d.topicId===id).map(d=>({...d,topic:byId.get(d.prerequisiteId)!}));
}
export function dependents(id:string) {
 if(!byId.has(id)) throw new Error('Unknown topic ID');
 return dependencies.filter(d=>d.prerequisiteId===id).map(d=>({...d,id:d.topicId,name:byId.get(d.topicId)!.name}));
}
export function learningPath(id:string,knownIds:string[]=[]) {
 if(!byId.has(id)) throw new Error('Unknown topic ID');
 const known=new Set(knownIds),visited=new Set<string>(),steps:Topic[]=[];
 function visit(next:string) {
  if(visited.has(next)||known.has(next)) return;
  visited.add(next);
  for(const d of dependencies.filter(d=>d.topicId===next&&d.strength==='hard')) visit(d.prerequisiteId);
  steps.push(byId.get(next)!);
 }
 visit(id);return {target:byId.get(id)!,steps,note:guidance};
}
export function frontier(knownIds:string[]=[],subject?:string) {
 const known=new Set(knownIds);
 return topics.filter(t=>!known.has(t.id)&&(!subject||t.subject===subject)&&dependencies.filter(d=>d.topicId===t.id&&d.strength==='hard').every(d=>known.has(d.prerequisiteId))).sort((a,b)=>b.centrality-a.centrality).slice(0,40);
}
