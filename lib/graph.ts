import original from '../data/topics.json';
import relations from '../data/dependencies.json';
import overlay from '../data/nz-overlay.json';

export interface Topic {
 id:string; type:string; subject:string; domain:string; name:string; description:string;
 ageRangeStart:number; ageRangeEnd:number; centrality:number; evidence:string[]; assessmentPrompt:string; standards:string[];
 nz?: {suggestedYears:number[];sourceIds:string[];mappingStatus:string;teacherReviewed:boolean;localContext:string;parentActivity:string};
}
export const topics:Topic[] = [...original.topics,...overlay.topics];
export const sources = overlay.sources;
export const dependencies = [...relations.dependencies,...overlay.topics.flatMap(t=>t.prerequisiteIds.map(id=>({topicId:t.id,prerequisiteId:id,strength:'hard',reason:'Suggested foundation for this NZ activity; editorial draft awaiting teacher review.'})))];
const byId = new Map(topics.map(t=>[t.id,t]));
export const subjects = [...new Set(topics.map(t=>t.subject))].sort();
export const guidance = 'Suggested learning pathway. NZ mappings and activities are editorial drafts, not teacher reviewed. Upstream ages are approximate and are not NZ year-level requirements. Use alongside classroom learning. Ask one question at a time and use evidence, not labels, to decide what to practise.';
export function getTopic(id:string) {return byId.get(id);}
export function searchTopics(query='',subject?:string,limit=40):Topic[] {
 const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 return topics.filter(t=>(!subject||t.subject===subject)&&terms.every(w=>`${t.name} ${t.description} ${t.domain} ${t.nz?.localContext||''}`.toLowerCase().includes(w)))
 .sort((a,b)=>Number(!!b.nz)-Number(!!a.nz)||b.centrality-a.centrality).slice(0,Math.min(100,Math.max(1,limit)));
}
export function prerequisites(id:string) {
 if(!byId.has(id)) throw new Error('Unknown topic ID');
 return dependencies.filter(d=>d.topicId===id).map(d=>({topic:byId.get(d.prerequisiteId)!,strength:d.strength,reason:d.reason}));
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
