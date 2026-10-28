/** Editorial learning topics based on the published English-medium NZ curriculum.
 * Source text and suggested teaching activities have different provenance; neither
 * the activities nor the graph edges are official assessment decisions. */
import english from '../data/nz-curriculum/english.json';
import science from '../data/nz-curriculum/science.json';
import social from '../data/nz-curriculum/social.json';
import arts from '../data/nz-curriculum/arts.json';
import health from '../data/nz-curriculum/health.json';
import technology from '../data/nz-curriculum/technology.json';
import languages from '../data/nz-curriculum/languages.json';
import bridges from '../data/nz-curriculum/bridges.json';

export interface CurriculumSource {
 id:string; title:string; url:string; status:string; checkedAt:string; documentUrl?:string;
}
export interface CurriculumTopic {
 id:string; name:string; domain:string; description:string; years:number[]; phase:string;
 sourceId:string; locator:string; objectives:string[]; evidence:string[]; misconceptions:string[];
 question:string; answer:string; explanation:string; hints:string[]; activity:string; materials:string[]; minutes:number;
 resources?:{label:string;url:string;attribution:string}[];
}
export interface CurriculumEdge {topicId:string;prerequisiteId:string;strength:'hard'|'helpful';reason:string;sourceId:string}
export interface CurriculumCoverage {
 strand:string; phase:string; years:number[]; sourceId:string; locator:string; topicIds:string[]; status:string; notes:string;
}
export interface CurriculumPackage {
 subject:string; sources:CurriculumSource[]; topics:CurriculumTopic[];
 dependencies:CurriculumEdge[]; coverage:CurriculumCoverage[]; limitations:string[];
}
export const curriculumPackages:CurriculumPackage[] = [english,science,social,arts,health,technology,languages] as CurriculumPackage[];
export const nzCurriculumSources = curriculumPackages.flatMap(p=>p.sources).map(s=>({
 ...s,license:'CC BY-NC 4.0, subject to Tāhūrangi copyright exceptions',
 attribution:'Ministry of Education, New Zealand. Curriculum material adapted by Learning Paths NZ.',
 licenseUrl:'https://newzealandcurriculum.tahurangi.education.govt.nz/copyright',
}));
const sourceById=new Map(nzCurriculumSources.map(s=>[s.id,s]));
const records=curriculumPackages.flatMap(p=>p.topics.map(topic=>({subject:p.subject,topic})));
export const nzCurriculumAdditions=records.map(({subject,topic:t})=>({
 id:t.id,type:'CONCEPTUAL',subject,domain:t.domain,name:t.name,description:t.description,
 ageRangeStart:null,ageRangeEnd:null,centrality:0,evidence:t.evidence,assessmentPrompt:t.question,standards:[] as string[],
}));
export const nzCurriculumProfiles=new Map(records.map(({subject,topic:t})=>[t.id,{
 id:t.id,subject,domain:t.domain,name:t.name,description:t.description,
 learning_objectives:t.objectives,understanding_evidence:t.evidence,common_misconceptions:t.misconceptions,
 diagnostic_questions:[{question:t.question,answer:t.answer,explanation:t.explanation,hints:t.hints,
  applicability:{years:t.years,standard_ids:[] as string[],notes:t.years.length?'Editorial question; confirm the learner’s needs and the mapped scope.':'Proficiency-based learning; no fixed school year is implied.'}}],
 short_activity:{instructions:t.activity,materials:t.materials,estimated_minutes:t.minutes},
 resources:t.resources||[],
 year_placement:{years:t.years,phase:t.phase,precision:t.years.length?'editorial_scope':'proficiency_based',
  rationale:t.years.length?'Year suggestions support discovery; read the source and adapt to the learner.':'Language learning follows proficiency and prior experience, not a fixed school year.',source_ids:[t.sourceId]},
 source_ids:[t.sourceId],source_locators:[{source_id:t.sourceId,locator:t.locator,supports:'Curriculum context; topic wording, activities and checks are editorial.'}],
 review_status:'research_draft',curriculum_mapping_ids:[`map_${t.id}`],
 content_license:'CC BY-NC 4.0; see curriculum source and Tāhūrangi copyright exceptions',
}]));
export type SupplementTeachingProfile=NonNullable<ReturnType<typeof nzCurriculumProfiles.get>>;
export const nzCurriculumMappings=records.map(({subject,topic:t})=>{
 const source=sourceById.get(t.sourceId);
 const unverifiedLanguageStage=subject==='Learning Languages'&&/editorial placement|not yet checked against language-specific/i.test(t.locator);
 return {id:`map_${t.id}`,topic_id:t.id,framework:'NZC_Y0_10',year_or_phase:t.phase,qualification_level:null,standard_id:null,standard_title:null,
  status:source?.status||'source not recorded',effective_from:null,effective_to:null,source_ids:[t.sourceId],
  source_locators:[{source_id:t.sourceId,locator:t.locator,supports:'Scope of curriculum content; teaching prompts and graph links are editorial.'}],
  mapping_basis:'editorial_alignment',mapping_confidence:'unreviewed',content_license:'CC BY-NC 4.0; see source exceptions',
  notes:t.years.length?`Suggested years ${t.years.join(', ')}. Curriculum alignment, activities and links are an unreviewed editorial draft.`:`Proficiency-based learning; no school year is implied. ${unverifiedLanguageStage?'The Novice placement is editorial and has not been checked against the language-specific teaching sequence. ':''}Curriculum alignment and activities are an unreviewed editorial draft.`,
 };
});
export type SupplementCurriculumMapping=typeof nzCurriculumMappings[number];
const byTopic=new Map(nzCurriculumMappings.map(m=>[m.topic_id,[m]]));
export function nzTopicMappings(id:string){return byTopic.get(id)||[];}
export const nzCurriculumEdges = [...curriculumPackages.flatMap(p=>p.dependencies),...(bridges as {dependencies:CurriculumEdge[]}).dependencies].map(e=>({
 topicId:e.topicId,prerequisiteId:e.prerequisiteId,strength:e.strength,reason:e.reason,basis:'pedagogical_inference',confidence:'unreviewed',source_ids:[e.sourceId],
}));
export function nzCurriculumContext(id:string){
 const pkg=curriculumPackages.find(p=>p.topics.some(t=>t.id===id));
 if(!pkg)return null;
 const item=pkg.topics.find(t=>t.id===id)!;
 return {mappings:nzTopicMappings(id),frameworks:[{framework_id:'NZC_Y0_10',learning_area:pkg.subject,source_ids:[item.sourceId]}],standards:[],
  coverage:pkg.coverage.filter(c=>c.topicIds.includes(id)),coverageGaps:pkg.limitations,
  note:'Published curriculum sources and implementation status are distinct from these unreviewed editorial alignments, practice questions and suggested links.'};
}
