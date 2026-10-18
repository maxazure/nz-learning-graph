import frameworks from '../data/nz-maths/curriculum-frameworks.json';
import standards from '../data/nz-maths/standards.json';
import requirements from '../data/nz-maths/curriculum-requirements.json';
import additions from '../data/nz-maths/topics.json';
import enrichments from '../data/nz-maths/topic-enrichments.json';
import mappings from '../data/nz-maths/curriculum-mappings.json';
import edges from '../data/nz-maths/dependencies.json';
import references from '../data/nz-maths/sources.json';

export type TeachingProfile = typeof additions[number] | typeof enrichments[number];
export type CurriculumMapping = typeof mappings[number];
export const mathsProfiles = new Map<string, TeachingProfile>([...additions,...enrichments].map(t=>[t.id,t]));
export const mathsAdditions = additions;
export const curriculumMappings = mappings;
export const mathsSources = references.map(s=>({...s,id:s.source_id}));
export const mathsDependencies = edges.map(d=>({...d,topicId:d.topic_id,prerequisiteId:d.prerequisite_id}));
export function topicMappings(id:string) {return mappings.filter(m=>m.topic_id===id);}
// Search bands only: retain the exact phase/time-in-school label in each mapping.
// NCEA qualification levels never assign a school year.
export function mappedYears(id:string):number[] {
 const years=new Set(mathsProfiles.get(id)?.year_placement.years||[]);
 for(const m of topicMappings(id).filter(m=>m.status==='current')){
  const label=m.year_or_phase||'';
  for(const match of label.matchAll(/\bYear (\d+)\b/g))years.add(Number(match[1]));
  if(/first six months|first year of schooling/i.test(label)){years.add(0);years.add(1);}
  if(/second year of schooling/i.test(label))years.add(2);
  if(/third year of schooling/i.test(label))years.add(3);
  if(m.framework==='NZC_2007_L6_8'&&m.curriculum_level)years.add(m.curriculum_level+5);
 }
 return [...years].sort((a,b)=>a-b);
}

export function curriculumContext(id:string){
 const mappings=topicMappings(id);
 return {mappings,frameworks:frameworks.filter(f=>mappings.some(m=>m.framework===f.framework_id)),standards:standards.filter(s=>mappings.some(m=>m.standard_id===s.standard_id)),coverageGaps:requirements.filter(r=>r.coverage_status==='partial'),note:'Mappings are scoped editorial alignments. Research coverage is not a guarantee of every curriculum requirement or assessment grade boundary.'};
}
