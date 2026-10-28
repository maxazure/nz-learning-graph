import {topics,dependencies,subjects,getTopic,yearsForTopic,graphSummary,type Topic,type Dependency} from '../lib/graph';
import {t} from './i18n';

/** Star map rendering. Every star and line comes from lib/graph; layout is deterministic, with no force simulation. */
export const esc=(s:unknown)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const num=(n:number)=>n.toLocaleString('en-NZ');
const f=(n:number)=>Math.round(n*10)/10;

// Luminous on the dark chart; unknown subjects get a stable hashed hue.
const palette:Record<string,string>={
 Mathematics:'#F4C35A',Statistics:'#F39A62',Science:'#57D0C4',English:'#B8A6F8',History:'#E8846C','Social Sciences':'#F0A98A',
 'The Arts':'#E68AF0','Health and Physical Education':'#FF8F8F',Technology:'#4DBFF0','Learning Languages':'#7FE3A6',
 Computing:'#7DA2FF','Life Skills':'#B2DC78','Learning to Learn':'#9CD3FA','Personal & Social Development':'#F59FC6',
};
const zhSubjects:Record<string,string>={
 Mathematics:'数学',Statistics:'统计',Science:'科学',English:'英语',History:'历史','Social Sciences':'社会科学','The Arts':'艺术',
 'Health and Physical Education':'健康与体育',Technology:'技术','Learning Languages':'语言学习',Computing:'计算机',
 'Life Skills':'生活技能','Learning to Learn':'学会学习','Personal & Social Development':'个人与社会发展',
};
function hash(s:string){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967295;}
export function subjectColour(subject:string){return palette[subject]||`hsl(${Math.round(hash(subject)*360)} 70% 70%)`;}
export function subjectName(subject:string){return t(subject,zhSubjects[subject]||subject);}

export interface SubjectStat {subject:string;count:number;within:number;crossOut:number;crossIn:number;cross:number}
export interface SubjectPair {a:string;b:string;total:number;ab:number;ba:number}
export interface GraphIndex {
 incoming:Map<string,Dependency[]>;outgoing:Map<string,Dependency[]>;degree:Map<string,number>;bridges:Map<string,number>;level:Map<string,number>;
 stats:SubjectStat[];statBySubject:Map<string,SubjectStat>;pairs:SubjectPair[];order:string[];crossTotal:number;ranked:Map<string,Topic[]>;
}
let cached:GraphIndex|undefined;
const pairKey=(a:string,b:string)=>a<b?`${a}\u0000${b}`:`${b}\u0000${a}`;
export function graphIndex():GraphIndex{
 if(cached)return cached;
 const incoming=new Map<string,Dependency[]>(),outgoing=new Map<string,Dependency[]>(),degree=new Map<string,number>(),bridges=new Map<string,number>();
 const statBySubject=new Map<string,SubjectStat>(subjects.map(s=>[s,{subject:s,count:0,within:0,crossOut:0,crossIn:0,cross:0}]));
 for(const topic of topics)statBySubject.get(topic.subject)!.count++;
 const pairMap=new Map<string,SubjectPair>();
 let crossTotal=0;
 for(const d of dependencies){
  const from=getTopic(d.prerequisiteId),to=getTopic(d.topicId);
  if(!from||!to)continue;
  (outgoing.get(from.id)||outgoing.set(from.id,[]).get(from.id)!).push(d);
  (incoming.get(to.id)||incoming.set(to.id,[]).get(to.id)!).push(d);
  degree.set(from.id,(degree.get(from.id)||0)+1);degree.set(to.id,(degree.get(to.id)||0)+1);
  if(from.subject===to.subject){statBySubject.get(from.subject)!.within++;continue;}
  crossTotal++;
  bridges.set(from.id,(bridges.get(from.id)||0)+1);bridges.set(to.id,(bridges.get(to.id)||0)+1);
  statBySubject.get(from.subject)!.crossOut++;statBySubject.get(to.subject)!.crossIn++;
  const key=pairKey(from.subject,to.subject);
  const [a,b]=from.subject<to.subject?[from.subject,to.subject]:[to.subject,from.subject];
  const pair=pairMap.get(key)||pairMap.set(key,{a,b,total:0,ab:0,ba:0}).get(key)!;
  pair.total++;if(from.subject===a)pair.ab++;else pair.ba++;
 }
 for(const s of statBySubject.values())s.cross=s.crossOut+s.crossIn;
 // Suggested links can form cycles. Give every member of a cycle the same
 // position in the progression, then rank the resulting acyclic graph.
 const seen=new Map<string,number>(),low=new Map<string,number>(),stack:string[]=[],onStack=new Set<string>();
 const component=new Map<string,number>();let next=0,componentCount=0;
 const visit=(id:string)=>{
  seen.set(id,next);low.set(id,next++);stack.push(id);onStack.add(id);
  for(const edge of outgoing.get(id)||[]){
   const other=edge.topicId;
   if(!seen.has(other)){visit(other);low.set(id,Math.min(low.get(id)!,low.get(other)!));}
   else if(onStack.has(other))low.set(id,Math.min(low.get(id)!,seen.get(other)!));
  }
  if(low.get(id)===seen.get(id)){
   let member:string;
   do{member=stack.pop()!;onStack.delete(member);component.set(member,componentCount);}while(member!==id);
   componentCount++;
  }
 };
 for(const topic of topics)if(!seen.has(topic.id))visit(topic.id);
 const parents=new Map<number,Set<number>>();
 for(const edge of dependencies){
  const from=component.get(edge.prerequisiteId),to=component.get(edge.topicId);
  if(from!==undefined&&to!==undefined&&from!==to)(parents.get(to)||parents.set(to,new Set()).get(to)!).add(from);
 }
 const depths=new Map<number,number>();
 const depth=(id:number):number=>{
  const known=depths.get(id);if(known!==undefined)return known;
  let d=0;for(const parent of parents.get(id)||[])d=Math.max(d,depth(parent)+1);
  depths.set(id,d);return d;
 };
 const level=new Map(topics.map(topic=>[topic.id,depth(component.get(topic.id)!)]));
 const byDegree=(a:Topic,b:Topic)=>(degree.get(b.id)||0)-(degree.get(a.id)||0)||a.id.localeCompare(b.id);
 const ranked=new Map<string,Topic[]>(subjects.map(s=>[s,topics.filter(x=>x.subject===s).sort(byDegree)]));
 // Greedy chain keeps strongly linked subjects next to each other on the ring.
 const link=(a:string,b:string)=>pairMap.get(pairKey(a,b))?.total||0;
 const count=(s:string)=>statBySubject.get(s)!.count;
 const remaining=[...subjects].sort((a,b)=>count(b)-count(a)||a.localeCompare(b));
 const order:string[]=remaining.length?[remaining.shift()!]:[];
 while(remaining.length){const last=order[order.length-1];remaining.sort((a,b)=>link(last,b)-link(last,a)||count(b)-count(a)||a.localeCompare(b));order.push(remaining.shift()!);}
 const stats=order.map(s=>statBySubject.get(s)!);
 const pairs=[...pairMap.values()].sort((x,y)=>y.total-x.total||x.a.localeCompare(y.a)||x.b.localeCompare(y.b));
 cached={incoming,outgoing,degree,bridges,level,stats,statBySubject,pairs,order,crossTotal,ranked};
 return cached;
}

// ---------- Text measurement and label placement ----------
export function textWidth(s:string,size:number){
 let w=0;
 for(const ch of s){const c=ch.codePointAt(0)!;w+=c>0x2e80?1:/[A-Z]/.test(ch)?.66:/[0-9]/.test(ch)?.58:/[ijlft.,'’ ()]/.test(ch)?.32:/[mwMW]/.test(ch)?.82:.54;}
 return w*size;
}
function fit(s:string,size:number,max:number){
 if(textWidth(s,size)<=max)return s;
 let out='';for(const ch of s){if(textWidth(out+ch+'…',size)>max)break;out+=ch;}
 return out.trimEnd()+'…';
}
function wrap(s:string,size:number,max:number,lines:number):string[]{
 const cjk=/[⺀-鿿]/.test(s)&&!/\s/.test(s);
 const words=cjk?[...s]:s.split(/\s+/);
 const rows:string[]=[''];
 for(const w of words){
  const row=rows[rows.length-1],next=row?row+(cjk?'':' ')+w:w;
  if(textWidth(next,size)<=max||!row)rows[rows.length-1]=next;else rows.push(w);
 }
 if(rows.length>lines){const kept=rows.slice(0,lines);kept[lines-1]=fit(kept[lines-1]+(cjk?'':' ')+rows.slice(lines).join(cjk?'':' '),size,max);return kept;}
 return rows.map(r=>fit(r,size,max));
}
interface Box {x:number;y:number;w:number;h:number}
const overlaps=(a:Box,b:Box,pad=3)=>a.x<b.x+b.w+pad&&b.x<a.x+a.w+pad&&a.y<b.y+b.h+pad&&b.y<a.y+a.h+pad;
type Side='right'|'left'|'below'|'above';
interface Placed {x:number;y:number;anchor:'start'|'end'|'middle';box:Box}
function candidate(side:Side,x:number,y:number,r:number,w:number,size:number,lines:number):Placed{
 const lh=size*1.2,h=lh*lines;
 if(side==='right')return {x:x+r+6,y:y-h/2+size*.85,anchor:'start',box:{x:x+r+4,y:y-h/2,w,h}};
 if(side==='left')return {x:x-r-6,y:y-h/2+size*.85,anchor:'end',box:{x:x-r-4-w,y:y-h/2,w,h}};
 if(side==='below')return {x,y:y+r+4+size*.85,anchor:'middle',box:{x:x-w/2,y:y+r+3,w,h}};
 return {x,y:y-r-4-h+size*.85,anchor:'middle',box:{x:x-w/2,y:y-r-4-h,w,h}};
}
function place(sides:Side[],x:number,y:number,r:number,w:number,size:number,lines:number,taken:Box[],W:number,H:number):Placed{
 let best:Placed|undefined,bestScore=Infinity;
 for(const [i,side] of sides.entries()){
  const c=candidate(side,x,y,r,w,size,lines);
  const out=Math.max(0,2-c.box.x)+Math.max(0,c.box.x+c.box.w-W+2)+Math.max(0,2-c.box.y)+Math.max(0,c.box.y+c.box.h-H+2);
  const hits=taken.filter(b=>overlaps(b,c.box)).length;
  const score=hits*1000+out*20+i;
  if(score<bestScore){best=c;bestScore=score;}
  if(score===i)break;
 }
 return best!;
}
function label(p:Placed,rows:string[],size:number,cls:string,extra=''){
 return `<text class="${cls}" x="${f(p.x)}" y="${f(p.y)}" text-anchor="${p.anchor}" font-size="${size}"${extra}>${rows.map((r,i)=>`<tspan x="${f(p.x)}" dy="${i?f(size*1.2):0}">${esc(r)}</tspan>`).join('')}</text>`;
}

// ---------- Scenes ----------
export type LegendKey='subjectLinks'|'sample'|'hard'|'helpful'|'bridge'|'bridgeNode'|'known'|'outside'|'progression';
export interface SceneNode {key:string;x:number;y:number;r:number}
export interface Scene {
 kind:'overview'|'field'|'focus';width:number;height:number;title:string;desc:string;body:string;
 nodes:SceneNode[];zoomable:boolean;shown:number;total:number;legend:LegendKey[];
 hover(key:string):string;
}
export interface SceneOptions {portrait:boolean;known:Set<string>}
const glow=(id:string,c:string)=>`<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset=".45" stop-color="${c}" stop-opacity=".16"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
const glows=()=>`<defs>${graphIndex().order.map((s,i)=>glow(`smglow${i}`,subjectColour(s))).join('')}</defs>`;
const haloFill=(subject:string)=>`url(#smglow${graphIndex().order.indexOf(subject)})`;
const ring=(n:SceneNode,cls='sm-ring-hover')=>`<circle class="${cls}" cx="${f(n.x)}" cy="${f(n.y)}" r="${f(n.r+5)}"/>`;
const deg=(id:string)=>graphIndex().degree.get(id)||0;
function starClasses(topic:Topic,o:SceneOptions,extra=''){return `sm-node${o.known.has(topic.id)?' is-known':''}${extra}`;}
function starMarkup(topic:Topic,x:number,y:number,r:number,o:SceneOptions,aria:string,extra='',halo=true,hit=9){
 const c=subjectColour(topic.subject);
 return `<g class="${starClasses(topic,o,extra)}" data-key="topic:${esc(topic.id)}" role="button" tabindex="-1" aria-label="${esc(aria)}"><circle class="sm-hit" cx="${f(x)}" cy="${f(y)}" r="${f(Math.max(hit,r+5))}"/>${halo?`<circle class="sm-halo" cx="${f(x)}" cy="${f(y)}" r="${f(r*3.2)}" fill="${haloFill(topic.subject)}"/>`:''}<circle class="sm-star" cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}"/>${o.known.has(topic.id)?`<circle class="sm-known" cx="${f(x)}" cy="${f(y)}" r="${f(r+2.6)}" stroke="${c}"/>`:''}</g>`;
}
const linkCounts=(id:string)=>({before:graphIndex().incoming.get(id)?.length||0,after:graphIndex().outgoing.get(id)?.length||0});
function topicAria(topic:Topic){const c=linkCounts(topic.id);return t(`${topic.name}, ${topic.subject}. ${c.before} before, ${c.after} after. Open.`,`${topic.name}，${subjectName(topic.subject)}。前置 ${c.before} 个，后续 ${c.after} 个。打开。`);}

export function overviewScene(o:SceneOptions):Scene{
 const ix=graphIndex(),W=o.portrait?400:1000,H=o.portrait?600:600,cx=W/2,cy=H/2;
 const n=ix.order.length,total=topics.length;
 const maxCount=Math.max(1,...ix.stats.map(s=>s.count));
 const rMax=o.portrait?(n>10?28:36):(n>10?50:64),rMin=o.portrait?9:15;
 const rx=o.portrait?W/2-74:W/2-175,ry=o.portrait?H/2-92:H/2-96;
 const pos=new Map<string,SceneNode&{a:number}>();
 ix.order.forEach((s,i)=>{const a=-Math.PI/2+i*2*Math.PI/Math.max(1,n),st=ix.statBySubject.get(s)!;pos.set(s,{key:`subject:${s}`,x:cx+rx*Math.cos(a),y:cy+ry*Math.sin(a),r:rMin+(rMax-rMin)*Math.sqrt(st.count/maxCount),a});});
 const maxPair=Math.max(1,...ix.pairs.map(p=>p.total));
 const curve=(p:SubjectPair)=>{const A=pos.get(p.a)!,B=pos.get(p.b)!,mx=(A.x+B.x)/2,my=(A.y+B.y)/2,qx=mx+(cx-mx)*.55,qy=my+(cy-my)*.55;return {d:`M${f(A.x)} ${f(A.y)}Q${f(qx)} ${f(qy)} ${f(B.x)} ${f(B.y)}`,at:(k:number)=>({x:(1-k)*(1-k)*A.x+2*k*(1-k)*qx+k*k*B.x,y:(1-k)*(1-k)*A.y+2*k*(1-k)*qy+k*k*B.y})};};
 const width=(p:SubjectPair)=>f(.7+(o.portrait?2.6:3.8)*Math.sqrt(p.total/maxPair));
 const bridges=[...ix.pairs].reverse().map(p=>`<path class="sm-bridge" d="${curve(p).d}" stroke-width="${width(p)}"/>`).join('');
 // Sample stars: the most connected real topics of each subject, sized to its share of the graph.
 const cap=o.portrait?300:620;let shown=0;
 const clusters:string[]=[],cluster=new Map<string,string>();
 ix.order.forEach((s,i)=>{
  const p=pos.get(s)!,members=ix.ranked.get(s)!,k=Math.min(members.length,Math.max(6,Math.round(cap*members.length/Math.max(1,total))));
  const sample=members.slice(0,k),at=new Map<string,{x:number;y:number}>();shown+=k;
  sample.forEach((m,j)=>{const rr=p.r*Math.sqrt((j+.5)/k),a=j*2.39996+i;at.set(m.id,{x:p.x+rr*Math.cos(a),y:p.y+rr*Math.sin(a)});});
  let lines='';
  for(const m of sample)for(const d of ix.outgoing.get(m.id)||[]){const to=at.get(d.topicId);if(to){const from=at.get(m.id)!;lines+=`M${f(from.x)} ${f(from.y)}L${f(to.x)} ${f(to.y)}`;}}
  const c=subjectColour(s);
  const stars=sample.map(m=>{const q=at.get(m.id)!;return `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="${f((o.portrait?.7:.9)+Math.min(1.6,deg(m.id)/14))}"${o.known.has(m.id)?' class="sm-dot-known"':''}/>`;}).join('');
  cluster.set(s,`<circle class="sm-halo-big" cx="${f(p.x)}" cy="${f(p.y)}" r="${f(p.r*1.5)}" fill="url(#smg${i})"/>${lines?`<path class="sm-cluster-lines" d="${lines}" stroke="${c}"/>`:''}<g class="sm-dots" fill="${c}">${stars}</g>`);
  clusters.push(glow(`smg${i}`,c));
 });
 // Subject labels avoid each other and the clusters.
 const size=o.portrait?11:13.5,taken:Box[]=[...pos.values()].map(p=>({x:p.x-p.r,y:p.y-p.r,w:p.r*2,h:p.r*2}));
 const labels=new Map<string,string>();
 for(const s of ix.order){
  const p=pos.get(s)!,st=ix.statBySubject.get(s)!,rows=wrap(subjectName(s),size,o.portrait?96:150,2),countRow=t(`${num(st.count)} topics`,`${num(st.count)} 个知识点`);
  const w=Math.max(...rows.map(r=>textWidth(r,size)),textWidth(countRow,size*.82)),lines=rows.length+1;
  const cos=Math.cos(p.a),sin=Math.sin(p.a);
  const first:Side=o.portrait?(sin<-.5?'above':'below'):cos>.35?'right':cos<-.35?'left':sin>0?'below':'above';
  const sides=[first,...(['below','above','right','left'] as Side[]).filter(x=>x!==first)];
  const pl=place(sides,p.x,p.y,p.r+2,w,size,lines,taken.filter(b=>!(b.x===p.x-p.r&&b.y===p.y-p.r)),W,H);taken.push(pl.box);
  labels.set(s,`<text class="sm-subject-label" x="${f(pl.x)}" y="${f(pl.y)}" text-anchor="${pl.anchor}" font-size="${size}" fill="${subjectColour(s)}">${rows.map((r,i)=>`<tspan x="${f(pl.x)}" dy="${i?f(size*1.2):0}">${esc(r)}</tspan>`).join('')}<tspan class="sm-subject-count" x="${f(pl.x)}" dy="${f(size*1.2)}" font-size="${f(size*.82)}">${esc(countRow)}</tspan></text>`);
 }
 const badge=(p:SubjectPair,boxes:Box[])=>{
  const c=curve(p),label=num(p.total),w=textWidth(label,11)+12,h=17;
  let at=c.at(.5),box:Box={x:at.x-w/2,y:at.y-h/2,w,h};
  for(const k of [.5,.4,.6,.32,.68,.25,.75]){const q=c.at(k),b={x:q.x-w/2,y:q.y-h/2,w,h};if(!boxes.some(x=>overlaps(x,b,1))){at=q;box=b;break;}}
  boxes.push(box);
  return `<g class="sm-badge"><rect x="${f(box.x)}" y="${f(box.y)}" width="${f(w)}" height="${h}" rx="8.5"/><text x="${f(at.x)}" y="${f(at.y+3.8)}" text-anchor="middle">${esc(label)}</text></g>`;
 };
 const topPairs=ix.pairs.slice(0,o.portrait?3:4),baseBoxes=[...taken];
 const defaultBadges=topPairs.map(p=>badge(p,baseBoxes)).join('');
 const nodes=ix.order.map(s=>pos.get(s)!);
 const body=`<defs>${clusters.join('')}</defs><g class="sm-bridges">${bridges}</g>${ix.order.map(s=>{
  const p=pos.get(s)!,st=ix.statBySubject.get(s)!;
  const aria=t(`${s}: ${num(st.count)} topics, ${num(st.cross)} links with other subjects. Show its topics.`,`${subjectName(s)}：${num(st.count)} 个知识点，与其他学科有 ${num(st.cross)} 条关联。查看它的知识点。`);
  return `<g class="sm-node sm-subject" data-key="subject:${esc(s)}" role="button" tabindex="-1" aria-label="${esc(aria)}"><circle class="sm-hit" cx="${f(p.x)}" cy="${f(p.y)}" r="${f(p.r+10)}"/>${cluster.get(s)}${labels.get(s)}</g>`;
 }).join('')}<g class="sm-badges">${defaultBadges}</g>`;
 return {kind:'overview',width:W,height:H,shown,total,zoomable:false,nodes,legend:['subjectLinks','sample'],
  title:t('Star map of all subjects','全部学科星图'),
  desc:t(`${n} subjects and ${num(total)} topics. ${num(shown)} of the most connected topics are drawn as stars. Lines join subjects whose topics link, with ${num(ix.crossTotal)} links across subjects. Use the arrow keys to move between subjects and Enter to open one.`,`${n} 个学科，${num(total)} 个知识点；图中以星点显示其中关联最多的 ${num(shown)} 个。连线表示学科之间的关联，共 ${num(ix.crossTotal)} 条跨学科关联。用方向键在学科之间移动，按 Enter 打开。`),
  body,
  hover(key){
   const s=key.slice(8),p=pos.get(s);if(!p)return '';
   const mine=ix.pairs.filter(x=>x.a===s||x.b===s),boxes=[...baseBoxes];
   return `${mine.map(x=>`<path class="sm-bridge-hl" d="${curve(x).d}" stroke-width="${width(x)}"/>`).join('')}${mine.filter(x=>!topPairs.includes(x)).map(x=>badge(x,boxes)).join('')}<circle class="sm-ring-hover" cx="${f(p.x)}" cy="${f(p.y)}" r="${f(p.r+8)}"/>`;
  }};
}

export interface FieldOptions extends SceneOptions {subject:string|null;title:string}
export function fieldScene(list:Topic[],o:FieldOptions):Scene{
 const ix=graphIndex(),cap=o.portrait?240:420;
 const shown=[...list].sort((a,b)=>deg(b.id)-deg(a.id)||a.id.localeCompare(b.id)).slice(0,cap);
 const W=o.portrait?400:1000,H=o.portrait?620:580;
 const band=(x:Topic)=>o.subject?(x.domain||'—'):x.subject;
 const groups=new Map<string,Topic[]>();
 for(const x of shown)(groups.get(band(x))||groups.set(band(x),[]).get(band(x))!).push(x);
 let bands=[...groups.entries()].map(([key,items])=>({key,label:o.subject?key:subjectName(key),items,subject:o.subject?null:key}));
 bands.sort((a,b)=>o.subject?b.items.length-a.items.length||a.key.localeCompare(b.key):ix.order.indexOf(a.key)-ix.order.indexOf(b.key));
 const maxBands=o.portrait?5:13;
 if(bands.length>maxBands){const rest=bands.slice(maxBands-1);bands=[...bands.slice(0,maxBands-1),{key:'\u0000other',label:o.subject?t(`Other domains (${rest.length})`,`其他领域（${rest.length}）`):t(`Other subjects (${rest.length})`,`其他学科（${rest.length}）`),items:rest.flatMap(b=>b.items),subject:null}];}
 // Geometry: progression runs left to right (landscape) or top to bottom (portrait).
 const m=o.portrait?{l:14,r:14,t:52,b:30}:{l:178,r:22,t:22,b:38};
 const bandSpan=o.portrait?W-m.l-m.r:H-m.t-m.b,levelSpan=o.portrait?H-m.t-m.b:W-m.l-m.r;
 const weights=bands.map(b=>Math.sqrt(b.items.length)+.6),wsum=weights.reduce((a,b)=>a+b,0);
 const levels=[...new Set(shown.map(x=>ix.level.get(x.id)||0))].sort((a,b)=>a-b);
 const cols=Math.max(1,Math.min(levels.length,o.portrait?10:14)),colOf=new Map(levels.map((l,i)=>[l,Math.floor(i*cols/levels.length)]));
 const pos=new Map<string,SceneNode>(),maxDeg=Math.max(1,...shown.map(x=>deg(x.id)));
 let start=0;const bandBoxes:{b:typeof bands[number];s0:number;s1:number}[]=[];
 bands.forEach((b,bi)=>{
  const span=bandSpan*weights[bi]/wsum,s0=start,s1=start+span;start=s1;bandBoxes.push({b,s0,s1});
  const cells=new Map<number,Topic[]>();
  for(const x of b.items){const c=colOf.get(ix.level.get(x.id)||0)!;(cells.get(c)||cells.set(c,[]).get(c)!).push(x);}
  for(const [c,items] of cells){
   const l0=levelSpan*c/cols,l1=levelSpan*(c+1)/cols,w=l1-l0,h=s1-s0;
   const per=Math.max(1,Math.floor(w/Math.max(7,Math.sqrt(w*h/items.length))));
   const rows=Math.ceil(items.length/per);
   items.sort((a,b)=>a.id.localeCompare(b.id)).forEach((x,i)=>{
    const col=i%per,row=Math.floor(i/per),jl=(hash(x.id)-.5)*Math.min(w/per,18)*.55,js=(hash(x.id+'y')-.5)*Math.min(h/rows,18)*.55;
    const lv=l0+(col+.5)*w/per+jl,bs=s0+(row+.5)*h/rows+js;
    const r=(o.portrait?1.9:2.3)+(o.portrait?2.2:2.8)*Math.sqrt(deg(x.id)/maxDeg);
    pos.set(x.id,{key:`topic:${x.id}`,x:o.portrait?m.l+bs:m.l+lv,y:o.portrait?m.t+lv:m.t+bs,r});
   });
  }
 });
 // Lines only between stars on screen; cross-subject links are drawn in gold.
 const paths:Record<string,string>={wh:'',ws:'',bh:'',bs:''};const adj=new Map<string,{other:string;cls:string;d:string}[]>();
 let bridgeLines=0;
 for(const x of shown)for(const d of ix.outgoing.get(x.id)||[]){
  const a=pos.get(x.id),b=pos.get(d.topicId);if(!a||!b)continue;
  const other=getTopic(d.topicId)!,bridge=other.subject!==x.subject,cls=(bridge?'b':'w')+(d.strength==='hard'?'h':'s');if(bridge)bridgeLines++;
  const seg=`M${f(a.x)} ${f(a.y)}L${f(b.x)} ${f(b.y)}`;paths[cls]+=seg;
  (adj.get(x.id)||adj.set(x.id,[]).get(x.id)!).push({other:d.topicId,cls,d:seg});
  (adj.get(d.topicId)||adj.set(d.topicId,[]).get(d.topicId)!).push({other:x.id,cls,d:seg});
 }
 const edgeCls:Record<string,string>={wh:'sm-edge',ws:'sm-edge sm-helpful',bh:'sm-edge sm-cross',bs:'sm-edge sm-cross sm-helpful'};
 const edges=Object.entries(paths).filter(([,d])=>d).map(([k,d])=>`<path class="${edgeCls[k]}" d="${d}"/>`).join('');
 // Band captions
 const capSize=o.portrait?10:11.5,taken:Box[]=[];
 const captions=bandBoxes.map(({b,s0,s1})=>{
  const colour=b.subject?subjectColour(b.subject):'#A9BDB2';
  if(o.portrait){const w=s1-s0;if(w<34)return '';const txt=fit(b.label,capSize,w-6),x=m.l+(s0+s1)/2;taken.push({x:x-w/2,y:m.t-38,w,h:30});return `<text class="sm-band" x="${f(x)}" y="${m.t-26}" text-anchor="middle" font-size="${capSize}" fill="${colour}">${esc(txt)}</text><text class="sm-band-n" x="${f(x)}" y="${m.t-12}" text-anchor="middle">${num(b.items.length)}</text>${s0>0?`<line class="sm-sep" x1="${f(m.l+s0)}" x2="${f(m.l+s0)}" y1="${m.t-6}" y2="${H-m.b}"/>`:''}`;}
  const y=m.t+(s0+s1)/2,rows=wrap(b.label,capSize,m.l-60,s1-s0>34?2:1);taken.push({x:0,y:y-16,w:m.l-12,h:32});
  return `<text class="sm-band" x="14" y="${f(y-(rows.length-1)*capSize*.6+4)}" font-size="${capSize}" fill="${colour}">${rows.map((r,i)=>`<tspan x="14" dy="${i?f(capSize*1.2):0}">${esc(r)}</tspan>`).join('')}</text><text class="sm-band-n" x="${m.l-12}" y="${f(y+4)}" text-anchor="end">${num(b.items.length)}</text>${s0>0?`<line class="sm-sep" x1="10" x2="${W-m.r}" y1="${f(m.t+s0)}" y2="${f(m.t+s0)}"/>`:''}`;
 }).join('');
 const axis=o.portrait?`<text class="sm-axis" x="${W-14}" y="${H-10}" text-anchor="end">${esc(t('↓ Builds towards later ideas','↓ 越往下，越是后续知识'))}</text>`:`<text class="sm-axis" x="${m.l}" y="${H-12}">${esc(t('Earlier foundations','较早的基础'))}</text><text class="sm-axis" x="${W-m.r}" y="${H-12}" text-anchor="end">${esc(t('Builds towards →','通向后续知识 →'))}</text>`;
 // A few always-on labels for the most connected stars; the rest appear on hover or focus.
 const anchors=shown.slice(0,o.portrait?4:8),labelled=new Set<string>(),labelSize=o.portrait?10.5:12;
 const anchorLabels=anchors.map(x=>{
  const p=pos.get(x.id)!,txt=fit(x.name,labelSize,o.portrait?130:190),w=textWidth(txt,labelSize);
  const pl=place(['right','left','above','below'],p.x,p.y,p.r,w,labelSize,1,taken,W,H);
  if(taken.some(b=>overlaps(b,pl.box)))return '';
  taken.push(pl.box);labelled.add(x.id);
  return label(pl,[txt],labelSize,'sm-label sm-label-anchor',` data-key="topic:${esc(x.id)}" translate="no"`);
 }).join('');
 const legend:LegendKey[]=['progression','hard','helpful'];
 if(bridgeLines)legend.push('bridge');
 if(o.subject&&shown.some(x=>ix.bridges.get(x.id)))legend.push('bridgeNode');
 if(shown.some(x=>o.known.has(x.id)))legend.push('known');
 const stars=shown.map(x=>{const p=pos.get(x.id)!;return starMarkup(x,p.x,p.y,p.r,o,topicAria(x),o.subject&&ix.bridges.get(x.id)?' has-bridge':'',p.r>3.4,8);}).join('');
 return {kind:'field',width:W,height:H,shown:shown.length,total:list.length,zoomable:true,legend,nodes:shown.map(x=>pos.get(x.id)!),
  title:o.title,
  desc:t(`${num(shown.length)} of ${num(list.length)} topics shown as stars, most connected first. Positions group topics by their recorded connections; suggested links are not mandatory prerequisites. Use the arrow keys to move between stars and Enter to open one.`,`显示 ${num(list.length)} 个知识点中关联最多的 ${num(shown.length)} 个。位置按已有知识关联分组，建议关联并非必修顺序。用方向键在星点之间移动，按 Enter 打开。`),
  body:`${glows()}<g class="sm-captions">${captions}${axis}</g><g class="sm-edges">${edges}</g><g class="sm-stars">${stars}</g><g class="sm-labels">${anchorLabels}</g>`,
  hover(key){
   const id=key.slice(6),p=pos.get(id),x=getTopic(id);if(!p||!x)return '';
   const links=adj.get(id)||[];
   const hl=links.map(l=>`<path class="sm-edge-hl${l.cls[0]==='b'?' sm-cross':''}${l.cls[1]==='s'?' sm-helpful':''}" d="${l.d}"/>`).join('');
   const near=links.map(l=>{const q=pos.get(l.other)!;return `<circle class="sm-near" cx="${f(q.x)}" cy="${f(q.y)}" r="${f(q.r+2)}"/>`;}).join('');
   let tag='';
   if(!labelled.has(id)){const txt=fit(x.name,13,o.portrait?220:300),w=textWidth(txt,13);const pl=place(['right','left','above','below'],p.x,p.y,p.r+3,w,13,1,taken,W,H);tag=label(pl,[txt],13,'sm-label sm-label-float',' translate="no"');}
   return hl+near+ring(p)+tag;
  }};
}

export interface FocusLink {topic:Topic;strength:string}
export interface FocusOptions extends SceneOptions {before:FocusLink[];after:FocusLink[];outside:(x:Topic)=>boolean}
export function focusScene(topic:Topic,o:FocusOptions):Scene{
 const ix=graphIndex(),cap=o.portrait?8:9;
 const order=(links:FocusLink[])=>[...links].sort((a,b)=>Number(b.strength==='hard')-Number(a.strength==='hard')||Number(b.topic.subject!==topic.subject)-Number(a.topic.subject!==topic.subject)||deg(b.topic.id)-deg(a.topic.id)||a.topic.name.localeCompare(b.topic.name));
 const sides={before:order(o.before),after:order(o.after)};
 const shownOf=(l:FocusLink[])=>l.length>cap?l.slice(0,cap-1):l;
 const before=shownOf(sides.before),after=shownOf(sides.after);
 const moreBefore=sides.before.length-before.length,moreAfter=sides.after.length-after.length;
 const fc=subjectColour(topic.subject);
 const nodes:SceneNode[]=[],parts:string[]=[],hoverEdge=new Map<string,string>();
 let anyOutside=false,anyBridge=false,anyHelpful=false,anyKnown=o.known.has(topic.id);
 const edgeClass=(l:FocusLink)=>{const bridge=l.topic.subject!==topic.subject;anyBridge||=bridge;anyHelpful||=l.strength!=='hard';return `sm-fedge${bridge?' sm-cross':''}${l.strength==='hard'?'':' sm-helpful'}`;};
 const marker=(l:FocusLink)=>l.topic.subject!==topic.subject?'url(#sm-arrow-x)':'url(#sm-arrow)';
 const aria=(l:FocusLink,side:'before'|'after')=>{
  const kind=side==='before'?(l.strength==='hard'?t('required foundation','必要基础'):t('helpful earlier link','有帮助的前置关联')):(l.strength==='hard'?t('builds on this topic','以此为基础'):t('helpful onward link','有帮助的后续关联'));
  const bridge=l.topic.subject!==topic.subject?t(` Links to ${l.topic.subject}.`,` 跨学科：${subjectName(l.topic.subject)}。`):'';
  return t(`${l.topic.name}, ${kind}.${bridge} Open.`,`${l.topic.name}，${kind}。${bridge}打开。`);
 };
 let W:number,H:number,cx:number,cy:number;
 const R=13,size=o.portrait?12:13;
 const nodeMarkup=(l:FocusLink,side:'before'|'after',x:number,y:number,rows:string[],anchor:'start'|'end',lx:number)=>{
  const outside=o.outside(l.topic);anyOutside||=outside;anyKnown||=o.known.has(l.topic.id);
  const bridge=l.topic.subject!==topic.subject,r=5.5+Math.min(2.5,deg(l.topic.id)/12);
  nodes.push({key:`topic:${l.topic.id}`,x,y,r});
  const lineH=size*1.2,sub=bridge?1:0,top=y-((rows.length+sub)*lineH)/2+size*.85;
  const text=`<text class="sm-label sm-label-focus" x="${f(lx)}" y="${f(top)}" text-anchor="${anchor}" font-size="${size}" translate="no">${rows.map((r,i)=>`<tspan x="${f(lx)}" dy="${i?f(lineH):0}">${esc(r)}</tspan>`).join('')}</text>${bridge?`<text class="sm-label sm-label-sub" x="${f(lx)}" y="${f(top+rows.length*lineH)}" text-anchor="${anchor}" font-size="${size-2}" fill="${subjectColour(l.topic.subject)}">${esc(subjectName(l.topic.subject))}</text>`:''}`;
  const c=subjectColour(l.topic.subject);
  return `<g class="${starClasses(l.topic,o,outside?' is-outside':'')}" data-key="topic:${esc(l.topic.id)}" role="button" tabindex="-1" aria-label="${esc(aria(l,side)+(outside?t(' Outside your current filters.',' 不在当前筛选范围内。'):''))}"><circle class="sm-hit" cx="${f(x)}" cy="${f(y)}" r="${f(r+9)}"/><circle class="sm-halo" cx="${f(x)}" cy="${f(y)}" r="${f(r*3)}" fill="${haloFill(l.topic.subject)}"/><circle class="sm-star" cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}"/>${o.known.has(l.topic.id)?`<circle class="sm-known" cx="${f(x)}" cy="${f(y)}" r="${f(r+3)}" stroke="${c}"/>`:''}${text}</g>`;
 };
 const moreMarkup=(side:'before'|'after',count:number,x:number,y:number,anchor:'start'|'end',lx:number)=>{
  nodes.push({key:`more:${side}`,x,y,r:5});
  const txt=t(`+${count} more · see all`,`另有 ${count} 个 · 查看全部`);
  return `<g class="sm-node sm-more" data-key="more:${side}" role="button" tabindex="-1" aria-label="${esc(t(`${count} more ${side==='before'?'earlier':'onward'} topics. Show the full list.`,`另有 ${count} 个${side==='before'?'前置':'后续'}知识点。显示完整列表。`))}"><circle class="sm-hit" cx="${f(x)}" cy="${f(y)}" r="14"/><circle class="sm-more-dot" cx="${f(x)}" cy="${f(y)}" r="5"/><text class="sm-label sm-label-more" x="${f(lx)}" y="${f(y+4)}" text-anchor="${anchor}" font-size="${size}">${esc(txt)}</text></g>`;
 };
 const head=(x:number,y:number,anchor:string,en:string,zh:string)=>`<text class="sm-heading" x="${f(x)}" y="${f(y)}" text-anchor="${anchor}">${esc(t(en,zh))}</text>`;
 const empty=(x:number,y:number,anchor:string,en:string,zh:string)=>`<text class="sm-empty-note" x="${f(x)}" y="${f(y)}" text-anchor="${anchor}">${esc(t(en,zh))}</text>`;
 const nb=before.length+(moreBefore?1:0),na=after.length+(moreAfter?1:0);
 if(!o.portrait){
  const gap=54,k=Math.max(nb,na,1);W=1000;H=Math.max(400,120+k*gap);cx=W/2;cy=H/2+12;
  const sideX=(i:number,count:number,dir:-1|1)=>{const tt=count>1?(i-(count-1)/2)/((count-1)/2):0;return cx+dir*(300-62*tt*tt);};
  const sideY=(i:number,count:number)=>cy+(i-(count-1)/2)*gap;
  parts.push(head(cx-300,34,'middle',`Comes before · ${sides.before.length}`,`前置知识 · ${sides.before.length}`),head(cx+300,34,'middle',`Leads to · ${sides.after.length}`,`后续知识 · ${sides.after.length}`));
  if(!nb)parts.push(empty(cx-300,cy+4,'middle','No earlier topics recorded','暂无记录的前置知识'));
  if(!na)parts.push(empty(cx+300,cy+4,'middle','No onward topics recorded yet','暂无记录的后续知识'));
  before.forEach((l,i)=>{const x=sideX(i,nb,-1),y=sideY(i,nb),d=`M${f(x+8)} ${f(y)}C${f(x+120)} ${f(y)} ${f(cx-150)} ${f(cy)} ${f(cx-R-6)} ${f(cy)}`;
   parts.push(`<path class="${edgeClass(l)}" d="${d}" marker-end="${marker(l)}"/>`);hoverEdge.set(`topic:${l.topic.id}`,`<path class="${edgeClass(l)} sm-fedge-hl" d="${d}"/>`);
   const lx=x-14;parts.push(nodeMarkup(l,'before',x,y,wrap(l.topic.name,size,lx-14,2),'end',lx));});
  if(moreBefore){const x=sideX(nb-1,nb,-1),y=sideY(nb-1,nb);parts.push(moreMarkup('before',moreBefore,x,y,'end',x-14));}
  after.forEach((l,i)=>{const x=sideX(i,na,1),y=sideY(i,na),d=`M${f(cx+R+4)} ${f(cy)}C${f(cx+150)} ${f(cy)} ${f(x-120)} ${f(y)} ${f(x-14)} ${f(y)}`;
   parts.push(`<path class="${edgeClass(l)}" d="${d}" marker-end="${marker(l)}"/>`);hoverEdge.set(`topic:${l.topic.id}`,`<path class="${edgeClass(l)} sm-fedge-hl" d="${d}"/>`);
   const lx=x+14;parts.push(nodeMarkup(l,'after',x,y,wrap(l.topic.name,size,W-lx-14,2),'start',lx));});
  if(moreAfter){const x=sideX(na-1,na,1),y=sideY(na-1,na);parts.push(moreMarkup('after',moreAfter,x,y,'start',x+14));}
 }else{
  const rowH=44,spine=96,lx=spine+16;W=400;
  let y=30;parts.push(`<text class="sm-heading" x="14" y="${y}">${esc(t(`Comes before · ${sides.before.length}`,`前置知识 · ${sides.before.length}`))}</text>`);y+=28;
  const rowsB=before.map(()=>{const at=y;y+=rowH;return at;});const moreBY=moreBefore?(y+=rowH)-rowH:0;
  if(!nb){parts.push(empty(lx,y+4,'start','No earlier topics recorded','暂无记录的前置知识'));y+=rowH;}
  cy=y+28;cx=spine;y=cy+86;
  parts.push(`<text class="sm-heading" x="14" y="${y}">${esc(t(`Leads to · ${sides.after.length}`,`后续知识 · ${sides.after.length}`))}</text>`);y+=28;
  const rowsA=after.map(()=>{const at=y;y+=rowH;return at;});const moreAY=moreAfter?(y+=rowH)-rowH:0;
  if(!na){parts.push(empty(lx,y+4,'start','No onward topics recorded yet','暂无记录的后续知识'));y+=rowH;}
  H=y+10;
  const arc=(y1:number,y2:number,toFocus:boolean)=>{const b=18+Math.min(78,Math.abs(y2-y1)*.28);return toFocus?`M${spine-7} ${f(y1)}C${f(spine-b)} ${f(y1)} ${f(spine-b)} ${f(y2)} ${spine-R-5} ${f(y2)}`:`M${spine-R-2} ${f(y1)}C${f(spine-b)} ${f(y1)} ${f(spine-b)} ${f(y2)} ${spine-11} ${f(y2)}`;};
  before.forEach((l,i)=>{const d=arc(rowsB[i],cy,true);parts.push(`<path class="${edgeClass(l)}" d="${d}" marker-end="${marker(l)}"/>`);hoverEdge.set(`topic:${l.topic.id}`,`<path class="${edgeClass(l)} sm-fedge-hl" d="${d}"/>`);parts.push(nodeMarkup(l,'before',spine,rowsB[i],wrap(l.topic.name,size,W-lx-12,2),'start',lx));});
  if(moreBefore)parts.push(moreMarkup('before',moreBefore,spine,moreBY,'start',lx));
  after.forEach((l,i)=>{const d=arc(cy,rowsA[i],false);parts.push(`<path class="${edgeClass(l)}" d="${d}" marker-end="${marker(l)}"/>`);hoverEdge.set(`topic:${l.topic.id}`,`<path class="${edgeClass(l)} sm-fedge-hl" d="${d}"/>`);parts.push(nodeMarkup(l,'after',spine,rowsA[i],wrap(l.topic.name,size,W-lx-12,2),'start',lx));});
  if(moreAfter)parts.push(moreMarkup('after',moreAfter,spine,moreAY,'start',lx));
 }
 // The selected star sits at the centre of its neighbourhood.
 const focusAria=t(`${topic.name}, selected. ${sides.before.length} topics come before and ${sides.after.length} lead on. Press Enter for the full guide.`,`${topic.name}，已选中。前置知识 ${sides.before.length} 个，后续知识 ${sides.after.length} 个。按 Enter 查看完整指南。`);
 const focusRows=o.portrait?wrap(topic.name,15,W-cx-30,3):wrap(topic.name,17,280,3);
 const fl=o.portrait?{x:cx+24,y:cy-((focusRows.length)*20)/2+9,anchor:'start'}:{x:cx,y:cy+R+30,anchor:'middle'};
 const focusLabel=`<text class="sm-label sm-label-centre" x="${f(fl.x)}" y="${f(fl.y)}" text-anchor="${fl.anchor}" font-size="${o.portrait?15:17}" translate="no">${focusRows.map((r,i)=>`<tspan x="${f(fl.x)}" dy="${i?(o.portrait?18:20):0}">${esc(r)}</tspan>`).join('')}</text><text class="sm-label sm-label-sub" x="${f(fl.x)}" y="${f(fl.y+focusRows.length*(o.portrait?18:20))}" text-anchor="${fl.anchor}" font-size="12" fill="${fc}">${esc(subjectName(topic.subject))}${o.known.has(topic.id)?esc(t(' · understood',' · 已掌握')):''}</text>`;
 nodes.splice(before.length+(moreBefore?1:0),0,{key:`topic:${topic.id}`,x:cx,y:cy,r:R});
 const focus=`<g class="sm-node sm-centre${o.known.has(topic.id)?' is-known':''}" data-key="topic:${esc(topic.id)}" role="button" tabindex="-1" aria-current="true" aria-label="${esc(focusAria)}"><circle class="sm-hit" cx="${f(cx)}" cy="${f(cy)}" r="${R+12}"/><circle class="sm-halo" cx="${f(cx)}" cy="${f(cy)}" r="${R*3.6}" fill="${haloFill(topic.subject)}"/><circle class="sm-centre-ring" cx="${f(cx)}" cy="${f(cy)}" r="${R+7}"/><circle class="sm-star" cx="${f(cx)}" cy="${f(cy)}" r="${R}" fill="${fc}"/>${o.known.has(topic.id)?`<circle class="sm-known" cx="${f(cx)}" cy="${f(cy)}" r="${R+3}" stroke="${fc}"/>`:''}${focusLabel}</g>`;
 const legend:LegendKey[]=[];
 if(o.before.some(l=>l.strength==='hard')||o.after.some(l=>l.strength==='hard'))legend.push('hard');
 if(anyHelpful)legend.push('helpful');
 if(anyBridge)legend.push('bridge');
 if(anyKnown)legend.push('known');
 if(anyOutside)legend.push('outside');
 const bridges=[...o.before,...o.after].filter(l=>l.topic.subject!==topic.subject).length;
 return {kind:'focus',width:W,height:H,shown:before.length+after.length+1,total:o.before.length+o.after.length+1,zoomable:false,nodes,legend,
  title:t(`Neighbourhood of ${topic.name}`,`${topic.name} 的知识邻域`),
  desc:t(`${sides.before.length} topics come before it and ${sides.after.length} lead on from it; ${bridges} of these links cross into another subject. ${moreBefore+moreAfter?'The full list shows every connection. ':''}Use the arrow keys to move and Enter to open a topic. Escape returns to the map.`,`它有 ${sides.before.length} 个前置知识、${sides.after.length} 个后续知识，其中 ${bridges} 条关联跨越学科。${moreBefore+moreAfter?'完整列表包含全部关联。':''}用方向键移动，按 Enter 打开知识点，按 Esc 返回星图。`),
  body:`${glows()}<defs><marker id="sm-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" class="sm-arrow"/></marker><marker id="sm-arrow-x" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" class="sm-arrow sm-arrow-x"/></marker></defs>${parts.join('')}${focus}`,
  hover(key){const n=nodes.find(x=>x.key===key);return n?(hoverEdge.get(key)||'')+ring(n):'';}};
}

// ---------- Interactive stage ----------
export interface StarMapHandlers {activate(key:string,via:'pointer'|'keyboard'):void;escape():void;layout():void}
export class StarMap {
 private scene?:Scene;private svg?:SVGSVGElement;private layer?:SVGGElement;private els=new Map<string,SVGGElement>();
 private active:string|null=null;private hovered:string|null=null;private focused:string|null=null;
 private view={k:1,x:0,y:0};private pointers=new Map<number,{x:number;y:number}>();private drag?:{x:number;y:number;vx:number;vy:number;moved:boolean;dist?:number;k?:number};private suppress=false;
 private canvas:HTMLElement;private controls:HTMLElement;private wasPortrait:boolean;
 constructor(private host:HTMLElement,private on:StarMapHandlers){
  host.innerHTML='<div class="sm-canvas"></div><div class="sm-zoom" hidden></div><div class="sm-message" hidden></div>';
  this.canvas=host.querySelector('.sm-canvas')!;this.controls=host.querySelector('.sm-zoom')!;
  this.wasPortrait=this.portrait;
  this.canvas.addEventListener('click',e=>{
   if(this.suppress){this.suppress=false;return;}
   const target=(e.target as Element).closest<SVGElement>('[data-key]');
   if(target)this.on.activate(target.dataset.key!,e.detail===0?'keyboard':'pointer');
  });
  this.canvas.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const n=(e.target as Element).closest<SVGGElement>('.sm-node');this.hover(n?.dataset.key||null);});
  this.canvas.addEventListener('pointerleave',()=>this.hover(null));
  this.canvas.addEventListener('focusin',e=>{const n=(e.target as Element).closest<SVGGElement>('.sm-node');if(n){this.focused=n.dataset.key!;this.setActive(this.focused);this.ensureVisible(this.focused);this.paint();}});
  this.canvas.addEventListener('focusout',e=>{if(!this.canvas.contains(e.relatedTarget as Node)){this.focused=null;this.paint();}});
  this.canvas.addEventListener('keydown',e=>this.key(e));
  this.canvas.addEventListener('pointerdown',e=>this.down(e));
  this.canvas.addEventListener('pointermove',e=>this.move(e));
  for(const type of ['pointerup','pointercancel'] as const)this.canvas.addEventListener(type,e=>this.up(e));
  this.canvas.addEventListener('wheel',e=>{if(!this.scene?.zoomable||!(e.ctrlKey||e.metaKey))return;e.preventDefault();const p=this.toSvg(e.clientX,e.clientY);this.zoomBy(e.deltaY<0?1.25:.8,p.x,p.y);},{passive:false});
  this.controls.addEventListener('click',e=>{const b=(e.target as Element).closest<HTMLButtonElement>('button');if(!b)return;const z=b.dataset.zoom;if(z==='in')this.zoomBy(1.5);else if(z==='out')this.zoomBy(1/1.5);else this.resetZoom();});
  new ResizeObserver(()=>{const p=this.portrait;if(p!==this.wasPortrait){this.wasPortrait=p;this.on.layout();}}).observe(host);
 }
 get portrait(){return (this.host.clientWidth||this.host.parentElement?.clientWidth||1000)<640;}
 get current(){return this.scene;}
 message(html:string|null){const box=this.host.querySelector<HTMLElement>('.sm-message')!;box.hidden=!html;box.innerHTML=html||'';this.canvas.hidden=!!html;if(html){this.controls.hidden=true;this.scene=undefined;}}
 render(scene:Scene,o:{focusKey?:string|null;keepView?:boolean}={}){
  const hadFocus=this.canvas.contains(document.activeElement);
  const keep=o.keepView&&this.scene?.kind===scene.kind&&this.scene.width===scene.width&&this.scene.height===scene.height;
  this.message(null);this.scene=scene;
  if(!keep)this.view={k:1,x:0,y:0};
  this.canvas.innerHTML=`<svg class="sm-svg sm-${scene.kind}" viewBox="0 0 ${scene.width} ${scene.height}" role="group" aria-labelledby="sm-title" aria-describedby="sm-desc"><title id="sm-title">${esc(scene.title)}</title><desc id="sm-desc">${esc(scene.desc)}</desc>${scene.body}<g class="sm-hover" aria-hidden="true"></g></svg>`;
  this.svg=this.canvas.querySelector('svg')!;this.layer=this.svg.querySelector('.sm-hover')!;
  this.els=new Map([...this.svg.querySelectorAll<SVGGElement>('.sm-node')].map(n=>[n.dataset.key!,n]));
  const want=[o.focusKey,this.active,scene.nodes[0]?.key].find(k=>k&&this.els.has(k))||null;
  this.hovered=null;this.focused=null;this.active=null;this.setActive(want);
  this.applyView();
  this.controls.hidden=!scene.zoomable;
  this.controls.innerHTML=`<button type="button" data-zoom="in" aria-label="${esc(t('Zoom in','放大'))}">+</button><button type="button" data-zoom="out" aria-label="${esc(t('Zoom out','缩小'))}">−</button><button type="button" data-zoom="reset">${esc(t('Reset','复位'))}</button>`;
  if(hadFocus&&want)this.els.get(want)!.focus({preventScroll:true});
 }
 focusNode(key:string){const k=this.els.has(key)?key:this.active;const n=k?this.els.get(k):undefined;if(n){this.setActive(k);n.focus({preventScroll:true});}}
 private setActive(key:string|null){
  if(this.active&&this.els.get(this.active))this.els.get(this.active)!.setAttribute('tabindex','-1');
  this.active=key;if(key)this.els.get(key)?.setAttribute('tabindex','0');
 }
 private hover(key:string|null){if(key===this.hovered)return;this.hovered=key;this.paint();}
 private paint(){
  if(!this.layer||!this.scene)return;
  const keys=[...new Set([this.focused,this.hovered].filter((k):k is string=>!!k))];
  this.layer.innerHTML=keys.map(k=>this.scene!.hover(k)).join('')+(this.focused&&this.focusVisible()?this.focusRing(this.focused):'');
 }
 private focusVisible(){try{return !!this.svg?.querySelector(':focus-visible');}catch{return true;}}
 private focusRing(key:string){const n=this.scene!.nodes.find(x=>x.key===key);return n?`<circle class="sm-ring-focus" cx="${f(n.x)}" cy="${f(n.y)}" r="${f(n.r+8)}"/>`:'';}
 private key(e:KeyboardEvent){
  if(!this.scene)return;
  const z=this.scene.zoomable;
  if(z&&(e.key==='+'||e.key==='=')){e.preventDefault();this.zoomBy(1.5);return;}
  if(z&&(e.key==='-'||e.key==='_')){e.preventDefault();this.zoomBy(1/1.5);return;}
  if(z&&e.key==='0'){e.preventDefault();this.resetZoom();return;}
  if(e.key==='Escape'){e.preventDefault();this.on.escape();return;}
  const current=this.scene.nodes.find(n=>n.key===this.active);
  if(!current)return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();this.on.activate(current.key,'keyboard');return;}
  if(e.key==='Home'||e.key==='End'){e.preventDefault();const n=e.key==='Home'?this.scene.nodes[0]:this.scene.nodes[this.scene.nodes.length-1];this.focusNode(n.key);return;}
  const dir:Record<string,[number,number]>={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]};
  const d=dir[e.key];if(!d)return;
  e.preventDefault();
  let best:SceneNode|undefined,score=Infinity;
  for(const n of this.scene.nodes){
   if(n===current)continue;
   const dx=n.x-current.x,dy=n.y-current.y,along=dx*d[0]+dy*d[1],across=Math.abs(dx*d[1]-dy*d[0]);
   if(along<=0.5)continue;
   const s=along+across*2.2;if(s<score){score=s;best=n;}
  }
  if(best)this.focusNode(best.key);
 }
 // ---------- Zoom and pan (field view only) ----------
 private applyView(){
  if(!this.svg||!this.scene)return;
  const {k,x,y}=this.view,W=this.scene.width,H=this.scene.height;
  this.svg.setAttribute('viewBox',`${f(x)} ${f(y)} ${f(W/k)} ${f(H/k)}`);
  this.svg.classList.toggle('is-zoomed',k>1.01);
 }
 private clamp(){const W=this.scene!.width,H=this.scene!.height,{k}=this.view;this.view.x=Math.min(Math.max(0,this.view.x),W-W/k);this.view.y=Math.min(Math.max(0,this.view.y),H-H/k);}
 zoomBy(factor:number,px?:number,py?:number){
  if(!this.scene?.zoomable)return;
  const W=this.scene.width,H=this.scene.height,{k,x,y}=this.view,next=Math.min(6,Math.max(1,k*factor));
  const ax=px??x+W/k/2,ay=py??y+H/k/2;
  this.view={k:next,x:ax-(ax-x)*k/next,y:ay-(ay-y)*k/next};this.clamp();this.applyView();
 }
 resetZoom(){this.view={k:1,x:0,y:0};this.applyView();}
 private ensureVisible(key:string){
  if(this.view.k<=1.01||!this.scene)return;
  const n=this.scene.nodes.find(x=>x.key===key);if(!n)return;
  const W=this.scene.width/this.view.k,H=this.scene.height/this.view.k,{x,y}=this.view;
  if(n.x<x+12||n.x>x+W-12||n.y<y+12||n.y>y+H-12){this.view.x=n.x-W/2;this.view.y=n.y-H/2;this.clamp();this.applyView();}
 }
 private toSvg(cx:number,cy:number){const r=this.svg!.getBoundingClientRect(),W=this.scene!.width/this.view.k,H=this.scene!.height/this.view.k;return {x:this.view.x+(cx-r.left)/r.width*W,y:this.view.y+(cy-r.top)/r.height*H};}
 private down(e:PointerEvent){
  if(!this.scene?.zoomable||!this.svg)return;
  this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(this.pointers.size===2){const [a,b]=[...this.pointers.values()];this.drag={x:(a.x+b.x)/2,y:(a.y+b.y)/2,vx:this.view.x,vy:this.view.y,moved:true,dist:Math.hypot(a.x-b.x,a.y-b.y),k:this.view.k};return;}
  if(this.view.k>1.01)this.drag={x:e.clientX,y:e.clientY,vx:this.view.x,vy:this.view.y,moved:false};
 }
 private move(e:PointerEvent){
  if(!this.drag||!this.svg||!this.scene||!this.pointers.has(e.pointerId))return;
  this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const r=this.svg.getBoundingClientRect();
  if(this.pointers.size===2&&this.drag.dist){
   e.preventDefault();
   const [a,b]=[...this.pointers.values()],dist=Math.hypot(a.x-b.x,a.y-b.y),mid=this.toSvg((a.x+b.x)/2,(a.y+b.y)/2);
   this.zoomBy(this.drag.k!*dist/this.drag.dist/this.view.k,mid.x,mid.y);this.suppress=true;return;
  }
  const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;
  if(!this.drag.moved&&Math.hypot(dx,dy)<5)return;
  if(!this.drag.moved){this.drag.moved=true;this.canvas.setPointerCapture?.(e.pointerId);}
  const sx=this.scene.width/this.view.k/r.width,sy=this.scene.height/this.view.k/r.height;
  this.view.x=this.drag.vx-dx*sx;this.view.y=this.drag.vy-dy*sy;this.clamp();this.applyView();
 }
 private up(e:PointerEvent){
  this.pointers.delete(e.pointerId);
  if(this.drag?.moved)this.suppress=true;
  if(!this.pointers.size)this.drag=undefined;
  setTimeout(()=>{this.suppress=false;},0);
 }
}

// ---------- Live counts and the hero preview ----------
function heroSky(){
 const ix=graphIndex(),W=320,H=150,cx=W/2,cy=H/2,n=ix.order.length,max=Math.max(1,...ix.stats.map(s=>s.count)),maxPair=Math.max(1,...ix.pairs.map(p=>p.total));
 const pos=new Map(ix.order.map((s,i)=>{const a=-Math.PI/2+i*2*Math.PI/Math.max(1,n);return [s,{x:cx+122*Math.cos(a),y:cy+54*Math.sin(a),r:3+9*Math.sqrt(ix.statBySubject.get(s)!.count/max)}];}));
 const lines=[...ix.pairs].reverse().map(p=>{const A=pos.get(p.a)!,B=pos.get(p.b)!,qx=(A.x+B.x)/2+(cx-(A.x+B.x)/2)*.55,qy=(A.y+B.y)/2+(cy-(A.y+B.y)/2)*.55;return `<path d="M${f(A.x)} ${f(A.y)}Q${f(qx)} ${f(qy)} ${f(B.x)} ${f(B.y)}" stroke-width="${f(.5+2.2*Math.sqrt(p.total/maxPair))}"/>`;}).join('');
 const stars=ix.order.map(s=>{const p=pos.get(s)!,c=subjectColour(s),k=Math.min(18,Math.max(3,Math.round(ix.statBySubject.get(s)!.count/40)));
  return `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="${f(p.r*1.9)}" fill="${c}" opacity=".16"/>${Array.from({length:k},(_,j)=>{const rr=p.r*1.3*Math.sqrt((j+.5)/k),a=j*2.39996;return `<circle cx="${f(p.x+rr*Math.cos(a))}" cy="${f(p.y+rr*Math.sin(a))}" r="${j?.8:1.6}" fill="${c}"/>`;}).join('')}`;}).join('');
 return `<svg viewBox="0 0 ${W} ${H}" focusable="false"><g fill="none" stroke="#F6D58E" stroke-opacity=".32">${lines}</g>${stars}</svg>`;
}
let statsReady=false;
function paintStats(){
 const s=graphSummary(),set=(sel:string,text:string)=>{const node=document.querySelector<HTMLElement>(sel);if(node){node.textContent=text;node.hidden=false;}};
 const sky=document.querySelector<HTMLElement>('#hero-starmap-sky');if(sky)sky.innerHTML=heroSky();
 set('#hero-starmap-stats',t(`${num(s.topics)} topics · ${num(s.links)} links · ${s.subjects} subjects · ${num(s.cross)} links cross subjects`,`${num(s.topics)} 个知识点 · ${num(s.links)} 条关联 · ${s.subjects} 个学科，其中 ${num(s.cross)} 条跨学科`));
 set('#graph-statement',t(`${num(s.topics)} topics and ${num(s.links)} connections across ${s.subjects} subjects help your AI find the small steps behind a bigger learning goal.`,`${num(s.topics)} 个知识点、${num(s.links)} 条关联，覆盖 ${s.subjects} 个学科，帮助 AI 查找一个学习目标背后需要掌握的基础。`));
 const years=s.minYear!==null&&s.maxYear!==null?` for Years ${s.minYear}–${s.maxYear}`:'',zhYears=s.minYear!==null&&s.maxYear!==null?`覆盖 Years ${s.minYear}–${s.maxYear} 的`:'';
 set('#nz-additions',t(`The original Marble graph is joined by ${num(s.nz)} NZ activities and NZ curriculum supplements${years}. ${num(s.mapped)} topics carry separate curriculum mappings, and ${num(s.taught)} include diagnostic questions and hints. Research drafts and remaining coverage gaps are documented.`,`在 Marble 原始图谱基础上，加入 ${num(s.nz)} 个新西兰活动和${zhYears}新西兰课程补充资料。其中 ${num(s.mapped)} 个知识点附有独立课程映射，${num(s.taught)} 个配有诊断题和提示。研究稿状态和待补缺口均有记录。`));
}
/** Fill runtime counts and the hero sky; safe to call more than once. */
export function setupGraphStats(){
 if(statsReady)return;statsReady=true;
 paintStats();window.addEventListener('site-language-change',paintStats);
}
