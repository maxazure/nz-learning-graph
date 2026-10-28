import {mathsProfiles,mathsAdditions,mathsDependencies,mathsSources,topicMappings as mathsTopicMappings,mappedYears,curriculumMappings as mathsCurriculumMappings,type TeachingProfile as MathsTeachingProfile,type CurriculumMapping as MathsCurriculumMapping} from './maths';
import {nzCurriculumAdditions,nzCurriculumProfiles,nzCurriculumMappings,nzCurriculumSources,nzCurriculumEdges,nzTopicMappings,type SupplementTeachingProfile,type SupplementCurriculumMapping} from './nz-curriculum';
export type TeachingProfile=MathsTeachingProfile|SupplementTeachingProfile;
export type CurriculumMapping=MathsCurriculumMapping|SupplementCurriculumMapping;
export const curriculumMappings:CurriculumMapping[]=[...mathsCurriculumMappings,...nzCurriculumMappings];
export function topicMappings(id:string):CurriculumMapping[]{return [...mathsTopicMappings(id),...nzTopicMappings(id)];}
import original from '../data/topics.json';
import relations from '../data/dependencies.json';
import overlay from '../data/nz-overlay.json';
import {canonicalTopicId,mathsCuration,sourceTopicIds,topicPatch} from './curation';

export interface Topic {
 id:string; type:string; subject:string; domain:string; name:string; description:string;
 ageRangeStart:number|null; ageRangeEnd:number|null; centrality:number; evidence:string[]; assessmentPrompt:string; standards:string[];
 teaching?:TeachingProfile; curriculumMappings?:CurriculumMapping[]; suggestedYears?:number[];
 sourceTopicIds?:string[];
 nz?: {suggestedYears:number[];sourceIds:string[];mappingStatus:string;teacherReviewed:boolean;localContext:string;parentActivity:string};
}
const base:Topic[] = [...original.topics,...overlay.topics];
const originalById=new Map(base.map(t=>[t.id,t]));
export function topicSearchText(t:Topic){
 const originals=sourceTopicIds(t.id).map(id=>originalById.get(id));
 const profile=t.teaching;
 return `${t.name} ${t.description} ${t.domain} ${t.nz?.localContext||''} ${profile?.description||''} ${(profile?.learning_objectives||[]).join(' ')} ${(profile?.diagnostic_questions||[]).map(q=>q.question).join(' ')} ${originals.map(old=>`${old?.name||''} ${old?.description||''}`).join(' ')}`.toLowerCase();
}
export const topics:Topic[] = [...base,...mathsAdditions.map(t=>({id:t.id,type:t.node_type,subject:t.subject,domain:t.domain,name:t.name,description:t.description,ageRangeStart:null,ageRangeEnd:null,centrality:0,evidence:t.understanding_evidence,assessmentPrompt:t.diagnostic_questions[0].question,standards:[]})),...nzCurriculumAdditions.filter(t=>!originalById.has(t.id)&&!mathsProfiles.has(t.id))].filter(t=>canonicalTopicId(t.id)===t.id).map(t=>{
 const teaching=mathsProfiles.get(t.id)||nzCurriculumProfiles.get(t.id), mappings=topicMappings(t.id);
 const members=sourceTopicIds(t.id),patch=topicPatch(t.id);
 const originals=members.map(id=>originalById.get(id)).filter((t):t is Topic=>!!t);
 return {
  ...t,
  // Retain Marble-authored text separately when adding a curriculum-derived
  // teaching profile; the records have different source licensing terms.
  ...(teaching?(originalById.has(t.id)&&nzCurriculumProfiles.has(t.id)?{teaching}:{name:teaching.name,description:teaching.description,evidence:teaching.understanding_evidence,assessmentPrompt:teaching.diagnostic_questions[0].question,teaching}):{}),
  ...(members.length>1?{
   sourceTopicIds:members,
   evidence:[...new Set([...originals.flatMap(o=>o.evidence),...(teaching?.understanding_evidence||[])])],
   standards:[...new Set(originals.flatMap(o=>o.standards))],
  }:{}),
  ...(patch?.name?{name:patch.name}:{}),
  ...(patch?.description?{description:patch.description}:{}),
  ...(patch?.evidence?{evidence:patch.evidence}:{}),
  ...(patch?.assessmentPrompt?{assessmentPrompt:patch.assessmentPrompt}:{}),
  ...(mappings.length?{curriculumMappings:mappings,suggestedYears:[...new Set([...mappedYears(t.id),...(nzCurriculumProfiles.get(t.id)?.year_placement.years||[])])].sort((a,b)=>a-b)}:{}),
 };
});
export const sources = [...overlay.sources,...mathsSources,...nzCurriculumSources];
export interface Dependency {topicId:string;prerequisiteId:string;strength:string;reason:string;basis?:string;confidence?:string;source_ids?:string[];source_locators?:unknown[]}
const baseline:Dependency[] = [...relations.dependencies.map(d=>({...d,strength:d.strength==='soft'?'helpful':d.strength})),...overlay.topics.flatMap(t=>t.prerequisiteIds.map(id=>({topicId:t.id,prerequisiteId:id,strength:'hard',reason:'Suggested foundation for this NZ activity.'})))];
// Supplement metadata replaces a matching endpoint pair; it is never appended twice.
const edgeMap=new Map<string,Dependency>(baseline.map(d=>[`${d.prerequisiteId}:${d.topicId}`,d]));
for(const d of mathsDependencies)edgeMap.set(`${d.prerequisiteId}:${d.topicId}`,d);
for(const d of nzCurriculumEdges){
 const key=`${d.prerequisiteId}:${d.topicId}`,prior=edgeMap.get(key);
 // A supplementary helpful link must never downgrade an inherited hard edge.
 edgeMap.set(key,prior?{...prior,strength:prior.strength==='hard'||d.strength==='hard'?'hard':'helpful',
  reason:[...new Set([prior.reason,d.reason])].join(' '),source_ids:[...new Set([...(prior.source_ids||[]),...d.source_ids])]}:d);
}
const curatedEdges=new Map<string,Dependency>();
for(const d of edgeMap.values()){
 const prerequisiteId=canonicalTopicId(d.prerequisiteId),topicId=canonicalTopicId(d.topicId);
 if(prerequisiteId===topicId)continue;
 const key=`${prerequisiteId}:${topicId}`,previous=curatedEdges.get(key);
 // Strip duplicate snake-case endpoints so callers have one authoritative pair.
 const {strength,reason,basis,confidence,source_ids,source_locators}=d;
 const current:Dependency={prerequisiteId,topicId,strength,reason,...(basis?{basis}:{}),...(confidence?{confidence}:{}),...(source_ids?{source_ids}:{}),...(source_locators?{source_locators}:{} )};
 if(previous){
  current.basis ||= previous.basis;
  current.confidence ||= previous.confidence;
  current.strength=previous.strength==='hard'||strength==='hard'?'hard':'helpful';
  current.reason=[...new Set([previous.reason,reason])].join(' ');
  current.source_ids=[...new Set([...(previous.source_ids||[]),...(source_ids||[])])];
  current.source_locators=[...new Map([...(previous.source_locators||[]),...(source_locators||[])].map(s=>[JSON.stringify(s),s])).values()];
 }
 curatedEdges.set(key,current);
}
// Reviewed decisions run after endpoint consolidation, including every strength conflict.
for(const d of mathsCuration.dependency_edits){
 const key=`${d.prerequisite_id}:${d.topic_id}`;
 if(d.action==='remove')curatedEdges.delete(key);
 else curatedEdges.set(key,{prerequisiteId:d.prerequisite_id,topicId:d.topic_id,strength:d.strength!,reason:d.reason,basis:d.basis,confidence:d.confidence,source_ids:d.source_ids,source_locators:d.source_locators});
}
export const dependencies:Dependency[]=[...curatedEdges.values()];
export function yearsForTopic(t:Topic){return t.suggestedYears||t.nz?.suggestedYears||[];}
const byId = new Map(topics.map(t=>[t.id,t]));
export const subjects = [...new Set(topics.map(t=>t.subject))].sort();
export const guidance = 'Use the learning graph to plan small steps. Check prerequisites, ask one question at a time and give hints before answers. Use the linked sources and distinguish suggested NZ years from original age ranges. A learner can also explore independently. Use diagnostic applicability and each curriculum mapping scope before choosing questions. Typical school years are not NCEA qualification levels. Research-draft pedagogy and inferred prerequisite edges are not official assessment decisions. One correct answer does not establish mastery or an NCEA grade.';
export function getTopic(id:string) {return byId.get(id);}
export function graphSummary(){
 const mapped=topics.filter(x=>x.curriculumMappings?.length),years=mapped.flatMap(yearsForTopic);
 return {topics:topics.length,links:dependencies.length,subjects:subjects.length,
  cross:dependencies.filter(d=>byId.get(d.topicId)?.subject!==byId.get(d.prerequisiteId)?.subject).length,
  nz:topics.filter(x=>x.nz).length,mapped:mapped.length,taught:topics.filter(x=>x.teaching).length,
  minYear:years.length?Math.min(...years):null,maxYear:years.length?Math.max(...years):null};
}
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
