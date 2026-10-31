import {topics,sources,subjects,dependencies,getTopic,prerequisites,learningPath,yearsForTopic,topicSearchText,dependents,type Topic} from '../lib/graph';
import {curriculumPackages} from '../lib/nz-curriculum';
import {topicGuide} from '../lib/topic-guide';
import {copy} from './clipboard';
import {t} from './i18n';
import {StarMap,graphIndex,subjectColour,subjectName,esc,num,overviewScene,fieldScene,focusScene,setupGraphStats,type LegendKey,type FocusLink} from './constellation';

export const escape=esc;
const el=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const PAGE=30;
const smooth=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth' as ScrollBehavior;
const scrollToEl=(node:Element)=>node.scrollIntoView({behavior:smooth(),block:'start'});

let selected:Topic|null=null,subject='',view:'stars'|'list'='stars',pageSize=PAGE,map:StarMap,lastScene='';
let known=new Set<string>();
try{const saved=JSON.parse(localStorage.getItem('nz-known-topics')||'[]');if(Array.isArray(saved))known=new Set(saved.filter(id=>typeof id==='string'&&getTopic(id)));}catch{}
const saveKnown=()=>{try{localStorage.setItem('nz-known-topics',JSON.stringify([...known]));}catch{}};

// ---------- Filters ----------
interface Filters {q:string;subject:string;year:string;nz:boolean}
const haystacks=new Map<string,string>();
const haystack=(x:Topic)=>{let s=haystacks.get(x.id);if(s===undefined){s=topicSearchText(x);haystacks.set(x.id,s);}return s;};
function filters():Filters{return {q:el<HTMLInputElement>('#topic-search').value.toLowerCase().trim(),subject,year:el<HTMLSelectElement>('#year-filter').value,nz:el<HTMLInputElement>('#nz-only').checked};}
const filtering=(f:Filters)=>!!(f.q||f.subject||f.year||f.nz);
function matches(x:Topic,f:Filters,anySubject=false){
 return (anySubject||!f.subject||x.subject===f.subject)&&(!f.nz||!!x.nz||!!x.curriculumMappings?.length)&&(!f.year||yearsForTopic(x).includes(Number(f.year)))&&f.q.split(/\s+/).filter(Boolean).every(w=>haystack(x).includes(w));
}
const rank=(a:Topic,b:Topic)=>Number(!!b.nz)-Number(!!a.nz)||Number(!!b.curriculumMappings?.length)-Number(!!a.curriculumMappings?.length)||b.centrality-a.centrality;
let memo={key:'',list:[] as Topic[],bySubject:new Map<string,number>()};
function results(f:Filters){
 const key=JSON.stringify(f);if(memo.key===key)return memo;
 const list:Topic[]=[],bySubject=new Map<string,number>();
 for(const x of topics){if(!matches(x,f,true))continue;bySubject.set(x.subject,(bySubject.get(x.subject)||0)+1);if(!f.subject||x.subject===f.subject)list.push(x);}
 memo={key,list:list.sort(rank),bySubject};return memo;
}
type Lens='overview'|'field'|'focus';
const lensOf=(f:Filters):Lens=>selected?'focus':filtering(f)?'field':'overview';

// ---------- Labels ----------
function yearsText(years:number[]){
 const runs:string[]=[];
 for(let i=0;i<years.length;i++){let j=i;while(j+1<years.length&&years[j+1]===years[j]+1)j++;runs.push(j>i?`${years[i]}–${years[j]}`:`${years[i]}`);i=j;}
 return runs.join(', ');
}
function yearLabel(x:Topic){const y=yearsForTopic(x);return y.length?t(`Suggested Year${y.length>1?'s':''} ${yearsText(y)}`,`建议年级：Year ${yearsText(y)}`):x.ageRangeStart!==null?t(`Approx. ages ${x.ageRangeStart}–${x.ageRangeEnd}`,`约 ${x.ageRangeStart}–${x.ageRangeEnd} 岁`):t('See curriculum scope','见课程范围');}
const statusLabel=(x:Topic)=>x.curriculumMappings?.length?t('NZ curriculum mapped','已对应新西兰课程'):x.nz?t('NZ activity','新西兰活动'):t('Original international topic','原始国际知识点');
const dot=(s:string)=>`<i class="sm-dot" style="--c:${subjectColour(s)}" aria-hidden="true"></i>`;
const counts=(id:string)=>({before:graphIndex().incoming.get(id)?.length||0,after:graphIndex().outgoing.get(id)?.length||0});
const linksOf=(x:Topic)=>({
 before:prerequisites(x.id).map(d=>({topic:d.topic,strength:d.strength,reason:d.reason,basis:d.basis,confidence:d.confidence})),
 after:dependents(x.id).map(d=>({topic:getTopic(d.id)!,strength:d.strength,reason:d.reason})).filter(d=>d.topic),
});

// ---------- URL and history ----------
function hashFor(){
 if(selected)return `#map?topic=${encodeURIComponent(selected.id)}`;
 if(subject)return `#map?subject=${encodeURIComponent(subject)}`;
 return location.hash.startsWith('#map?')?'#map':'';
}
function syncUrl(push:boolean){
 const state={starmap:true,topic:selected?.id||null,subject},href=hashFor()||location.pathname+location.search+location.hash;
 if(push)history.pushState(state,'',href);else history.replaceState(state,'',href);
}
function applyHash(){
 const hash=location.hash;
 if(hash==='#map'){selected=null;subject='';return true;}
 if(!hash.startsWith('#map?'))return false;
 const params=new URLSearchParams(hash.slice(5)),id=params.get('topic'),s=params.get('subject');
 subject=s&&subjects.includes(s)?s:'';
 selected=id?getTopic(id)||null:null;
 return true;
}
function onPop(e:PopStateEvent){
 const state=e.state as {starmap?:boolean;topic?:string|null;subject?:string}|null;
 if(state?.starmap){selected=state.topic?getTopic(state.topic)||null:null;subject=state.subject&&subjects.includes(state.subject)?state.subject:'';render();return;}
 if(!location.hash.startsWith('#map'))return;
 const linked=applyHash();render();
 if(linked)scrollToEl(el('#map'));
}
function onHashChange(){
 const hash=location.hash;
 if(hash==='#map'&&(selected||subject)){applyHash();render();return;}
 if(!hash.startsWith('#map?'))return;
 const params=new URLSearchParams(hash.slice(5)),id=params.get('topic'),s=params.get('subject');
 // A popstate may already have restored a subject context for this same topic.
 if((id&&selected?.id===id)||(s!==null&&!selected&&subject===s))return;
 if(applyHash())render();
}

// ---------- Navigation ----------
function select(topic:Topic|null,o:{focusKey?:string|null;scroll?:boolean}={}){
 selected=topic;syncUrl(true);render({focusKey:o.focusKey});
 if(o.scroll)scrollToEl(el('#starmap'));
 // The control that was used may have been re-rendered away; keep keyboard users in the map.
 const lost=!document.activeElement||document.activeElement===document.body;
 if(view==='list'&&(lost||o.scroll))el('#list-title')?.focus({preventScroll:true});
 else if(lost&&o.focusKey)map.focusNode(o.focusKey);
}
function back(){const previous=selected;select(null,{focusKey:previous?`topic:${previous.id}`:null});}
function onFilter(){pageSize=PAGE;const had=!!selected;selected=null;syncUrl(had);render();}
function setSubject(s:string){subject=s;onFilter();}
function clearFilters(){
 el<HTMLInputElement>('#topic-search').value='';el<HTMLSelectElement>('#year-filter').value='';el<HTMLInputElement>('#nz-only').checked=false;
 subject='';pageSize=PAGE;syncUrl(false);render();
}
function toggleKnown(id:string){known.has(id)?known.delete(id):known.add(id);saveKnown();render();}
function activate(key:string){
 if(key.startsWith('subject:')){setSubject(key.slice(8));return;}
 if(key.startsWith('more:')){view='list';render();el(`#list-${key.slice(5)}`)?.focus();return;}
 const topic=getTopic(key.slice(6));if(!topic)return;
 if(selected?.id===topic.id){openGuide();return;}
 select(topic,{focusKey:key});
}
function openGuide(){const detail=el('#topic-detail');if(detail.hidden)return;scrollToEl(detail);el('#detail-title')?.focus({preventScroll:true});}

/** Called by the hero search and topic chips. */
export function searchFor(q:string){
 el<HTMLInputElement>('#topic-search').value=q;el<HTMLSelectElement>('#year-filter').value='';el<HTMLInputElement>('#nz-only').checked=false;subject='';onFilter();
}

// ---------- Rendering ----------
function render(o:{focusKey?:string|null}={}){
 const focusKey=(document.activeElement as HTMLElement|null)?.dataset?.fk;
 const f=filters(),r=results(f),lens=lensOf(f);
 renderSubjects(f,r);renderCrumbs(f);renderView();renderStage(f,r,lens,o.focusKey);renderList(f,r,lens);renderPanel(f,r,lens);renderDetail(f);
 el('#clear-filters').hidden=!filtering(f);
 el('#known-count').textContent=t(`${known.size} ${known.size===1?'topic':'topics'} marked as understood on this browser`,`此浏览器已将 ${known.size} 个知识点标记为已掌握`);
 el('#clear-known').hidden=!known.size;
 if(focusKey&&(!document.activeElement||document.activeElement===document.body))document.querySelector<HTMLElement>(`[data-fk="${CSS.escape(focusKey)}"]`)?.focus({preventScroll:true});
}
function renderSubjects(f:Filters,r:ReturnType<typeof results>){
 const all=[...r.bySubject.values()].reduce((a,b)=>a+b,0);
 el('#subjects').innerHTML=`<button type="button" class="subject-chip" data-subject="" data-fk="chip:" aria-pressed="${!f.subject}">${esc(t('All subjects','所有学科'))} <span class="c">${num(all)}</span></button>${graphIndex().order.map(s=>{const n=r.bySubject.get(s)||0;return `<button type="button" class="subject-chip${n?'':' is-empty'}" data-subject="${esc(s)}" data-fk="chip:${esc(s)}" aria-pressed="${f.subject===s}">${dot(s)}${esc(subjectName(s))} <span class="c">${num(n)}</span></button>`;}).join('')}`;
}
function renderCrumbs(f:Filters){
 const items:{label:string;action:string;attrs?:string}[]=[{label:esc(t('All subjects','全部学科')),action:'all'}];
 if(f.subject)items.push({label:dot(f.subject)+esc(subjectName(f.subject)),action:'subject'});
 if(f.q||f.year||f.nz)items.push({label:esc([f.q?`“${f.q}”`:'',f.year?`Year ${f.year}`:'',f.nz?t('NZ mapped','新西兰映射'):''].filter(Boolean).join(' · ')),action:'field',attrs:' translate="no"'});
 if(selected)items.push({label:esc(selected.name),action:'',attrs:' translate="no" lang="en-NZ"'});
 el('#starmap-crumbs').innerHTML=items.map((x,i)=>i===items.length-1?`<span aria-current="page"${x.attrs||''}>${x.label}</span>`:`<button type="button" data-action="${x.action}" data-fk="crumb:${x.action}"${x.attrs||''}>${x.label}</button>`).join('<span class="sep" aria-hidden="true">›</span>');
}
function renderView(){
 for(const b of document.querySelectorAll<HTMLButtonElement>('[data-view]'))b.setAttribute('aria-pressed',String(b.dataset.view===view));
 el('#starmap-stage').hidden=view!=='stars';el('#starmap-list').hidden=view!=='list';
}
const legendItems:Record<LegendKey,()=>string>={
 subjectLinks:()=>`<span><i class="lg-line lg-gold lg-thick"></i>${esc(t('Links between subjects, thicker means more','学科间关联，越粗越多'))}</span>`,
 sample:()=>`<span><i class="lg-dots"></i>${esc(t('Stars are the most connected topics','星点是关联最多的知识点'))}</span>`,
 progression:()=>'',
 hard:()=>`<span><i class="lg-line"></i>${esc(t('Required foundation','必要基础'))}</span>`,
 helpful:()=>`<span><i class="lg-line lg-dashed"></i>${esc(t('Helpful link','有帮助的关联'))}</span>`,
 bridge:()=>`<span><i class="lg-line lg-gold"></i>${esc(t('Crosses into another subject','跨学科关联'))}</span>`,
 bridgeNode:()=>`<span><i class="lg-star lg-star-bridge"></i>${esc(t('Has links to other subjects','与其他学科有关联'))}</span>`,
 known:()=>`<span><i class="lg-star lg-star-known"></i>${esc(t('Marked as understood','已标记为掌握'))}</span>`,
 outside:()=>`<span><i class="lg-star lg-star-dim"></i>${esc(t('Outside your filters','不在当前筛选范围'))}</span>`,
};
function emptyState(){return `<div class="sm-empty"><p>${esc(t('No topics match. Try a shorter English search, such as time or fractions.','没有匹配的知识点。请尝试更短的英文关键词，例如 time 或 fractions。'))}</p><button type="button" class="sp-btn" data-action="clear" data-fk="empty-clear">${esc(t('Clear search and filters','清除搜索和筛选'))}</button></div>`;}
function renderStage(f:Filters,r:ReturnType<typeof results>,lens:Lens,focusKey?:string|null){
 const legend=el('#starmap-legend'),status=el('#results-count');
 const sceneId=`${lens}|${r.key}|${selected?.id||''}|${map.portrait}`,keepView=sceneId===lastScene;lastScene=sceneId;
 if(lens==='field'&&!r.list.length){
  if(view==='stars')map.message(emptyState());
  legend.innerHTML='';status.textContent=t('No matching topics','没有匹配的知识点');return;
 }
 const o={portrait:map.portrait,known};
 const scene=lens==='overview'?overviewScene(o):lens==='field'?fieldScene(r.list,{...o,subject:f.subject||null,title:f.subject?t(`${f.subject} star map`,`${subjectName(f.subject)}星图`):t('Star map of matching topics','匹配知识点星图')}):(()=>{
  const links=linksOf(selected!);
  return focusScene(selected!,{...o,before:links.before as FocusLink[],after:links.after as FocusLink[],outside:x=>filtering(f)&&!matches(x,f)});
 })();
 if(view==='stars')map.render(scene,{focusKey,keepView});
 legend.innerHTML=view==='stars'?scene.legend.map(k=>legendItems[k]()).join(''):'';
 const n=graphIndex().order.length;
 status.textContent=lens==='overview'?t(`${num(topics.length)} topics in ${n} subjects · ${num(scene.shown)} shown as stars`,`${n} 个学科共 ${num(topics.length)} 个知识点 · 图中显示 ${num(scene.shown)} 颗星`)
  :lens==='field'?(view==='list'?t(`${num(r.list.length)} ${r.list.length===1?'topic matches':'topics match'}`,`${num(r.list.length)} 个匹配的知识点`):scene.shown<r.list.length?t(`${num(r.list.length)} topics match · ${num(scene.shown)} most connected shown as stars · the list shows all`,`${num(r.list.length)} 个匹配的知识点 · 图中显示关联最多的 ${num(scene.shown)} 个 · 列表可查看全部`):t(`${num(r.list.length)} ${r.list.length===1?'topic matches':'topics match'} · all shown`,`${num(r.list.length)} 个匹配的知识点 · 已全部显示`))
  :t(`${selected!.name}: ${scene.total-1} connections · ${scene.shown-1} shown`,`${selected!.name}：共 ${scene.total-1} 条关联 · 图中显示 ${scene.shown-1} 条`);
}
function row(x:Topic,extra=''){
 const c=counts(x.id);
 return `<li><button type="button" class="sm-row${selected?.id===x.id?' is-selected':''}" data-topic="${esc(x.id)}" data-fk="row:${esc(x.id)}">${dot(x.subject)}<span class="sm-row-text"><strong translate="no" lang="en-NZ">${esc(x.name)}</strong><small>${esc(subjectName(x.subject))} · ${esc(yearLabel(x))} · ${esc(t(`${c.before} before · ${c.after} after`,`前置 ${c.before} · 后续 ${c.after}`))}${extra}</small></span>${known.has(x.id)?`<span class="sm-row-known">${esc(t('✓ Understood','✓ 已掌握'))}</span>`:''}</button></li>`;
}
function renderList(f:Filters,r:ReturnType<typeof results>,lens:Lens){
 const box=el('#starmap-list');if(view!=='list'){box.innerHTML='';return;}
 if(lens==='focus'){
  const x=selected!,links=linksOf(x);
  const group=(id:string,title:string,items:{topic:Topic;strength:string}[],side:'before'|'after',none:string)=>`<h4 id="list-${id}" tabindex="-1">${esc(title)}</h4>${items.length?`<ul class="sm-rows">${items.map(l=>row(l.topic,` · ${esc(side==='before'?(l.strength==='hard'?t('Required foundation','必要基础'):t('Helpful link','有帮助的关联')):(l.strength==='hard'?t('Builds on this','以此为基础'):t('Helpful link','有帮助的关联')))}${l.topic.subject!==x.subject?` · <span class="sm-bridge-tag">${esc(t('Other subject','跨学科'))}</span>`:''}`)).join('')}</ul>`:`<p class="sm-none">${esc(none)}</p>`}`;
  box.innerHTML=`<h3 id="list-title" tabindex="-1" class="sm-list-title"><span class="sm-kicker">${esc(t('All connections of','全部关联：'))}</span> <span translate="no" lang="en-NZ">${esc(x.name)}</span></h3>${group('before',t(`Comes before · ${links.before.length}`,`前置知识 · ${links.before.length}`),links.before,'before',t('No earlier topics recorded.','暂无记录的前置知识。'))}${group('after',t(`Leads to · ${links.after.length}`,`后续知识 · ${links.after.length}`),links.after,'after',t('No onward topics recorded yet.','暂无记录的后续知识。'))}`;
  return;
 }
 if(!r.list.length){box.innerHTML=emptyState();return;}
 box.innerHTML=`<h3 id="list-title" tabindex="-1" class="sr-only">${esc(t('Topic list','知识点列表'))}</h3><ol class="sm-rows">${r.list.slice(0,pageSize).map(x=>row(x)).join('')}</ol>${r.list.length>pageSize?`<button type="button" class="sp-btn sm-more-btn" data-action="more" data-fk="more">${esc(t(`Show more topics (${num(r.list.length-pageSize)} left)`,`显示更多知识点（还有 ${num(r.list.length-pageSize)} 个）`))}</button>`:''}`;
}
function topList(items:Topic[],n=5){return `<ul class="sp-topics">${[...items].sort((a,b)=>(graphIndex().degree.get(b.id)||0)-(graphIndex().degree.get(a.id)||0)).slice(0,n).map(x=>`<li><button type="button" data-topic="${esc(x.id)}" data-fk="sp-topic:${esc(x.id)}">${dot(x.subject)}<span translate="no" lang="en-NZ">${esc(x.name)}</span></button></li>`).join('')}</ul>`;}
function officialCurriculum(subject:string){
 const pkg=curriculumPackages.find(p=>p.subject===subject);
 const links=subject==='English'?pkg!.sources.map((s,i)=>({url:s.url,label:t(`Phase ${i+1}`,`第 ${i+1} 阶段`)}))
  :pkg?[{url:pkg.sources[0].url,label:t('Open curriculum','查看课程')}]
  :['Mathematics','Statistics'].includes(subject)?[{url:'https://newzealandcurriculum.tahurangi.education.govt.nz/nzc---mathematics-and-statistics-phases-1-4-years-0-10/5637289330.p',label:t('Open curriculum','查看课程')}]:[];
 if(!links.length)return '';
 return `<div class="sp-source"><h4 class="sp-h">${esc(t('Official NZ curriculum · Years 0–10','新西兰官方课程 · 0–10 年级'))}</h4>${links.map(l=>`<a class="sp-link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join(' ')}</div>`;
}
function renderPanel(f:Filters,r:ReturnType<typeof results>,lens:Lens){
 const ix=graphIndex(),panel=el('#starmap-panel');
 if(lens==='overview'){
  const pair=(p:typeof ix.pairs[number])=>`<li><span class="sp-pair">${dot(p.a)}${esc(subjectName(p.a))}<span aria-hidden="true"> ⇄ </span><span class="sr-only"> ${esc(t('and','与'))} </span>${dot(p.b)}${esc(subjectName(p.b))}</span><b>${num(p.total)}</b><small>${esc(t(`${p.a} first: ${p.ab} · ${p.b} first: ${p.ba}`,`${subjectName(p.a)}在前 ${p.ab} · ${subjectName(p.b)}在前 ${p.ba}`))}</small></li>`;
  panel.innerHTML=`<h3 class="sp-title">${esc(t('How the subjects connect','学科之间如何连接'))}</h3><p class="sp-lede">${esc(t(`${num(ix.crossTotal)} of ${num(dependencies.length)} links join topics in different subjects. Choose a subject to see its stars.`,`${num(dependencies.length)} 条关联中，有 ${num(ix.crossTotal)} 条连接不同学科的知识点。选择一个学科，查看它的星点。`))}</p>${ix.pairs.length?`<h4 class="sp-h">${esc(t('Strongest bridges','联系最紧密的学科'))}</h4><ol class="sp-bridges">${ix.pairs.slice(0,5).map(pair).join('')}</ol>${ix.pairs.length>5?`<details class="sp-all"><summary>${esc(t(`All ${ix.pairs.length} subject pairs`,`全部 ${ix.pairs.length} 组学科关联`))}</summary><ol class="sp-bridges">${ix.pairs.slice(5).map(pair).join('')}</ol></details>`:''}`:''}`;
  return;
 }
 if(lens==='field'){
  if(!r.list.length){panel.innerHTML=`<h3 class="sp-title">${esc(t('Nothing matches yet','暂时没有匹配'))}</h3><p class="sp-lede">${esc(f.year&&f.subject==='Learning Languages'?t('Language-learning stages follow proficiency and have no fixed school year. Clear the year filter to see them.','语言学习按熟练程度分阶段，没有固定学校年级。清除年级筛选即可查看。'):f.year?t('Year filters include topics with suggested NZ years. Topics without a mapped year are excluded.','年级筛选只包含有建议新西兰年级的知识点，未对应年级的知识点不会显示。'):t('Search uses English topic names. Try one shorter word.','搜索使用英文知识点名称，可以试试更短的单个词。'))}</p>`;return;}
  if(f.subject){
   const st=ix.statBySubject.get(f.subject)!;
   const others=ix.pairs.filter(p=>p.a===f.subject||p.b===f.subject).map(p=>({s:p.a===f.subject?p.b:p.a,total:p.total,out:p.a===f.subject?p.ab:p.ba,inn:p.a===f.subject?p.ba:p.ab}));
   panel.innerHTML=`<p class="sp-kicker">${dot(f.subject)}${esc(subjectName(f.subject))}</p><h3 class="sp-title">${esc(t(`${num(r.list.length)} ${r.list.length===1?'topic':'topics'}`,`${num(r.list.length)} 个知识点`))}</h3><p class="sp-lede">${esc(t(`${num(st.within)} links inside this subject · ${num(st.cross)} links with other subjects`,`学科内关联 ${num(st.within)} 条 · 跨学科关联 ${num(st.cross)} 条`))}</p>${others.length?`<h4 class="sp-h">${esc(t('Links with other subjects','与其他学科的关联'))}</h4><ul class="sp-links">${others.map(o=>`<li><button type="button" data-subject="${esc(o.s)}" data-fk="sp-subject:${esc(o.s)}">${dot(o.s)}${esc(subjectName(o.s))}</button><b>${num(o.total)}</b><small>${esc(t(`${o.out} lead there · ${o.inn} come from there`,`通向该学科 ${o.out} · 来自该学科 ${o.inn}`))}</small></li>`).join('')}</ul>`:''}<h4 class="sp-h">${esc(t('Most connected here','这里关联最多的知识点'))}</h4>${topList(r.list)}${officialCurriculum(f.subject)}`;
   return;
  }
  panel.innerHTML=`<h3 class="sp-title">${esc(t(`${num(r.list.length)} matching ${r.list.length===1?'topic':'topics'}`,`${num(r.list.length)} 个匹配的知识点`))}</h3><p class="sp-lede">${esc(t('Choose a subject to narrow the map, or open a star.','选择一个学科缩小范围，或直接打开一颗星。'))}</p><ul class="sp-links">${ix.order.filter(s=>r.bySubject.get(s)).map(s=>`<li><button type="button" data-subject="${esc(s)}" data-fk="sp-subject:${esc(s)}">${dot(s)}${esc(subjectName(s))}</button><b>${num(r.bySubject.get(s)!)}</b></li>`).join('')}</ul><h4 class="sp-h">${esc(t('Most connected matches','关联最多的匹配知识点'))}</h4>${topList(r.list)}`;
  return;
 }
 const x=selected!,links=linksOf(x),outside=filtering(f)&&!matches(x,f);
 const bridgeSubjects=new Map<string,number>();
 for(const l of [...links.before,...links.after])if(l.topic.subject!==x.subject)bridgeSubjects.set(l.topic.subject,(bridgeSubjects.get(l.topic.subject)||0)+1);
 const bridges=[...bridgeSubjects.values()].reduce((a,b)=>a+b,0),hard=links.before.filter(l=>l.strength==='hard').length;
 const summary=topicGuide(x),description=summary.description;
 const desc=description.length>220?description.slice(0,description.lastIndexOf(' ',210)>0?description.lastIndexOf(' ',210):210)+'…':description;
 panel.innerHTML=`<p class="sp-kicker">${dot(x.subject)}${esc(subjectName(x.subject))} · <span translate="no" lang="en-NZ">${esc(summary.domain)}</span></p><h3 class="sp-title" translate="no" lang="en-NZ">${esc(x.name)}</h3><p class="sp-desc" translate="no" lang="en-NZ">${esc(desc)}</p><p class="sp-pills"><span>${esc(yearLabel(x))}</span><span>${esc(statusLabel(x))}</span></p>${outside?`<p class="sp-note">${esc(t('This topic sits outside your current filters, so it is shown for context.','这个知识点不在当前筛选范围内，仅作为关联背景显示。'))} <button type="button" class="sp-link" data-action="clear" data-fk="sp-clear">${esc(t('Clear search and filters','清除搜索和筛选'))}</button></p>`:''}<dl class="sp-stats"><div><dt>${esc(t('Comes before','前置知识'))}</dt><dd>${num(links.before.length)}<small>${esc(t(`${hard} required`,`${hard} 个必要`))}</small></dd></div><div><dt>${esc(t('Leads to','后续知识'))}</dt><dd>${num(links.after.length)}</dd></div><div><dt>${esc(t('Other subjects','跨学科'))}</dt><dd>${num(bridges)}</dd></div></dl>${bridgeSubjects.size?`<p class="sp-bridge-subjects">${[...bridgeSubjects].sort((a,b)=>b[1]-a[1]).map(([s,n])=>`<span>${dot(s)}${esc(subjectName(s))} ${n}</span>`).join('')}</p>`:''}<div class="sp-actions"><button type="button" class="sp-btn${known.has(x.id)?' is-on':''}" data-action="known" data-fk="sp-known" aria-pressed="${known.has(x.id)}">${esc(known.has(x.id)?t('✓ Marked as understood','✓ 已标记为掌握'):t('Mark as understood','标记为已掌握'))}</button><button type="button" class="sp-btn sp-btn-quiet" data-action="guide" data-fk="sp-guide">${esc(t('Open the full guide ↓','查看完整指南 ↓'))}</button><button type="button" class="sp-link" data-action="back" data-fk="sp-back">${esc(t('← Back to the map','← 返回星图'))}</button><button type="button" class="sp-link" data-action="link" data-fk="sp-link">${esc(t('Copy a link to this topic','复制这个知识点的链接'))}</button></div>`;
}

// ---------- Topic guide (pedagogy and sources stay in English) ----------
interface LooseQuestion {question?:string;applicability?:{years?:number[];notes?:string};hints?:string[];answer?:string;explanation?:string}
interface LooseProfile {learning_objectives?:string[];common_misconceptions?:string[];diagnostic_questions?:LooseQuestion[];short_activity?:{estimated_minutes?:number;instructions?:string};resources?:{label:string;url:string;attribution:string}[];year_placement?:{rationale?:string}}
interface LooseMapping {framework?:string;year_or_phase?:string|null;status?:string;qualification_level?:number|string|null;standard_id?:string|null;standard_title?:string|null;notes?:string;source_locators?:{source_id:string;locator?:string}[]}
function teachingDetails(x:Topic){
 const p=x.teaching as unknown as LooseProfile|undefined;
 const list=(items?:string[])=>items?.length?`<ul>${items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:'';
 const pedagogy=p?`<section class="teaching-profile" translate="no" lang="en-NZ">${p.learning_objectives?.length?`<h4>Learning objectives</h4>${list(p.learning_objectives)}`:''}${p.common_misconceptions?.length?`<h4>Common misconceptions to check</h4>${list(p.common_misconceptions)}`:''}${p.diagnostic_questions?.length?`<h4>Diagnostic questions and gradual hints</h4>${p.diagnostic_questions.map(q=>`<article class="question-card"><p>${esc(q.question||'')}</p>${q.applicability?`<p class="fine-print">Diagnostic placement: ${q.applicability.years?.length?`Years ${esc(yearsText(q.applicability.years))}. `:''}${esc(q.applicability.notes||'')}</p>`:''}${(q.hints||[]).map((h,i)=>`<details><summary>Hint ${i+1}</summary><p>${esc(h)}</p></details>`).join('')}${q.answer||q.explanation?`<details><summary>Answer and explanation</summary>${q.answer?`<p>${esc(q.answer)}</p>`:''}${q.explanation?`<p>${esc(q.explanation)}</p>`:''}</details>`:''}</article>`).join('')}`:''}${p.short_activity?.instructions?`<h4>Short activity${p.short_activity.estimated_minutes?` · ${p.short_activity.estimated_minutes} minutes`:''}</h4><p>${esc(p.short_activity.instructions)}</p>`:''}${p.resources?.length?`<h4>Activity resources</h4><ul>${p.resources.filter(r=>/^https:\/\//.test(r.url)).map(r=>`<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a> · ${esc(r.attribution)}</li>`).join('')}</ul>`:''}<p class="fine-print">${p.year_placement?.rationale?esc(p.year_placement.rationale)+' ':''}Research draft; not teacher moderated.</p></section>`:'';
 const mappings=(x.curriculumMappings||[]) as unknown as LooseMapping[];
 const curriculum=mappings.length?`<details class="curriculum-detail"><summary>${esc(t(`NZ curriculum and assessment mappings (${mappings.length})`,`新西兰课程与评估映射（${mappings.length}）`))}</summary><p>${esc(t('Each mapping applies only to its stated scope. School years, NZC levels and NCEA qualification levels are separate. A diagnostic answer does not award a standard.','每条映射只适用于其注明的范围。学校年级、NZC 水平和 NCEA 资格等级需分别理解；一道诊断题的回答不代表取得某项标准。'))}</p><div translate="no" lang="en-NZ">${mappings.map(m=>`<article><h4>${esc(m.framework||'Curriculum mapping')} · ${esc(m.year_or_phase||'No fixed school year')}</h4><p>${esc(m.status||'')}${m.qualification_level?` · Qualification Level ${esc(m.qualification_level)}`:''}${m.standard_id?` · Standard ${esc(m.standard_id)}${m.standard_title?`: ${esc(m.standard_title)}`:''}`:''}</p>${m.notes?`<p>${esc(m.notes)}</p>`:''}${m.source_locators?.length?`<ul>${m.source_locators.map(l=>{const source=sources.find(s=>s.id===l.source_id);return `<li>${source?`<a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.title)}</a>`:esc(l.source_id)}${l.locator?` · ${esc(l.locator)}`:''}</li>`;}).join('')}</ul>`:''}</article>`).join('')}</div></details>`:'';
 return pedagogy+curriculum;
}
function renderDetail(f:Filters){
 const detail=el('#topic-detail');
 if(!selected){detail.hidden=true;detail.innerHTML='';return;}
 const x=selected,links=linksOf(x),path=learningPath(x.id,[...known]),outside=filtering(f)&&!matches(x,f);
 const guide=topicGuide(x,f.year?Number(f.year):null);
 const activity=(x.teaching as unknown as LooseProfile|undefined)?.short_activity?.instructions||x.nz?.parentActivity;
 const linkRow=(l:{topic:Topic;strength:string;reason:string;basis?:string;confidence?:string},side:'before'|'after')=>`<div class="prerequisite">${dot(l.topic.subject)}<button type="button" class="text-button" data-topic="${esc(l.topic.id)}" data-fk="detail:${esc(l.topic.id)}" translate="no" lang="en-NZ">${esc(l.topic.name)}</button><span class="pill">${esc(side==='before'?(l.strength==='hard'?t('Required foundation','必要基础'):t('Helpful link','有帮助的关联')):(l.strength==='hard'?t('Builds on this','以此为基础'):t('Helpful link','有帮助的关联')))}</span>${l.topic.subject!==x.subject?`<span class="pill pill-bridge">${esc(subjectName(l.topic.subject))}</span>`:''}<p translate="no" lang="en-NZ">${esc(l.reason)}</p>${l.basis?`<p class="fine-print" translate="no" lang="en-NZ">${esc(l.basis)}${l.confidence?` · ${esc(l.confidence)} confidence`:''}</p>`:''}</div>`;
 detail.hidden=false;
 detail.innerHTML=`<div class="detail-heading"><p class="eyebrow">${esc(t('Topic guide','知识点指南'))}</p><p class="detail-kicker">${dot(x.subject)}${esc(subjectName(x.subject))} / <span translate="no" lang="en-NZ">${esc(guide.domain)}</span></p><h3 id="detail-title" tabindex="-1" translate="no" lang="en-NZ">${esc(x.name)}</h3><p translate="no" lang="en-NZ">${esc(guide.description)}</p><span class="pill">${esc(yearLabel(x))}</span> <span class="pill">${esc(statusLabel(x))}</span>${outside?` <span class="pill pill-outside">${esc(t('Outside current filters','不在当前筛选范围'))}</span>`:''}</div>
 <div class="detail-columns"><div><h4>${esc(t('Look for these signs of understanding','留意这些理解的表现'))}</h4><ul translate="no" lang="en-NZ">${guide.evidence.map(e=>`<li>${esc(e)}</li>`).join('')}</ul><div class="question-card"><span class="eyebrow">${esc(t('A question to try','试试这个问题'))}</span>${guide.question?`<p translate="no" lang="en-NZ">${esc(guide.question.replaceAll('{{name}}','your child'))}</p>${guide.questionYears.length?`<p class="fine-print">${esc(t(`Suggested for Years ${yearsText(guide.questionYears)}`,`建议适用年级：Year ${yearsText(guide.questionYears)}`))}</p>`:''}`:`<p>${esc(t(`No diagnostic is scoped to Year ${f.year}. Check the question scopes below.`,`暂无标注适用于 Year ${f.year} 的诊断题，请查看下方题目的适用范围。`))}</p>`}</div></div>
 <div><h4>${esc(x.nz?t('Try it in Aotearoa','在新西兰生活中试试'):t('Try it together','一起试试'))}</h4>${activity?`<p translate="no" lang="en-NZ">${esc(activity)}</p>`:`<p>${esc(t('Ask your child to explain their thinking with an everyday example. Offer one small hint, then let them try again.','请孩子用一个日常例子讲讲自己的想法。给一点小提示，再让孩子试一次。'))}</p>`}${x.nz?`<p translate="no" lang="en-NZ">${esc(x.nz.localContext)}</p><h4>${esc(t('Sources','资料来源'))}</h4><ul translate="no" lang="en-NZ">${sources.filter(s=>x.nz!.sourceIds.includes(s.id)).map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a></li>`).join('')}</ul>`:''}<p class="fine-print">${esc(x.curriculumMappings?.length?t('Suggested search bands; read the precise scope and source for each mapping below.','建议年级仅用于检索，请查看下方每条映射的具体范围和来源。'):x.nz?t('Suggested NZ year band and home activity.','建议的新西兰年级范围和家庭活动。'):t('Original Marble age guidance; this topic has not been mapped to a NZ year level.','沿用 Marble 原始适龄建议，这个知识点尚未对应新西兰年级。'))}</p></div></div>
 ${teachingDetails(x)}
 <section class="all-connections" aria-labelledby="connections-title"><h4 id="connections-title">${esc(t('Every connection','全部关联'))}</h4><p class="fine-print">${esc(t('Required foundations come first in the practice sequence. Helpful links are suggestions, not requirements.','练习顺序只包含必要基础。有帮助的关联是建议，并非必须先学。'))}</p>
 <details${links.before.length&&links.before.length<=12?' open':''}><summary>${esc(t(`Comes before: ${links.before.length} earlier ${links.before.length===1?'topic':'topics'}`,`前置知识：${links.before.length} 个`))}</summary>${links.before.length?links.before.map(l=>linkRow(l,'before')).join(''):`<p>${esc(t('This graph lists no earlier foundations for this topic.','图谱中暂无这个知识点的前置基础。'))}</p>`}</details>
 <details${links.after.length&&links.after.length<=12?' open':''}><summary>${esc(t(`Leads to: ${links.after.length} onward ${links.after.length===1?'topic':'topics'}`,`后续知识：${links.after.length} 个`))}</summary>${links.after.length?links.after.map(l=>linkRow(l,'after')).join(''):`<p>${esc(t('No later topics are recorded yet.','暂无记录的后续知识。'))}</p>`}</details></section>
 <div class="path-panel"><div><span class="eyebrow">${esc(t('Your practice sequence','你的练习顺序'))}</span><h4>${esc(path.steps.length?t(`${path.steps.length} ${path.steps.length===1?'step':'steps'}, foundations first`,`共 ${path.steps.length} 步，先打基础`):t('You have marked this topic as understood','你已将这个知识点标记为已掌握'))}</h4><p class="fine-print">${esc(t('Includes required foundations only. Topics you mark as understood are skipped. Saved on this browser only.','只包含必要基础；标记为已掌握的知识点会被跳过。记录仅保存在此浏览器。'))}</p></div><button type="button" id="mark-known" class="button secondary" data-action="known" data-fk="detail-known" aria-pressed="${known.has(x.id)}">${esc(known.has(x.id)?t('Mark as still practising','改为仍在练习'):t('Mark as understood','标记为已掌握'))}</button><ol class="learning-steps">${path.steps.map(s=>`<li><button type="button" class="text-button${known.has(s.id)?' is-known':''}" data-topic="${esc(s.id)}" data-fk="step:${esc(s.id)}" translate="no" lang="en-NZ">${esc(s.name)}</button></li>`).join('')}</ol><button type="button" id="copy-lesson" class="button" data-action="copy" data-fk="copy">${esc(t('Copy a prompt for your AI','复制提示词，交给你的 AI'))} <span aria-hidden="true">↗</span></button></div>`;
}
function copyPrompt(button:HTMLElement){
 const x=selected!;
 const prompt=`I am exploring learning in New Zealand, for myself or with my child. Use the Knowledge Star Map Skill MCP tools to get topic ${x.id} (${x.name}), check its prerequisites and create a short learning path. Topics I have observed them understand: ${[...known].join(', ')||'not assessed yet'}. Ask for the specific question and working without identifying details. Read the topic teaching profile and curriculum mappings. Choose a diagnostic appropriate to its applicability and mapped scope. Ask one question at a time; use the answer to check foundations, suggest a short activity, then return to the original question. A single response is not proof of mastery or an NCEA grade. Give hints before answers. Cite topic IDs and the available sources. Do not request identifying information about my child. If the MCP tools are unavailable, say so rather than inventing graph results.`;
 void copy(prompt,button);
}

// ---------- Events ----------
function onClick(e:MouseEvent){
 const target=(e.target as Element).closest<HTMLElement>('[data-topic],[data-subject],[data-action],[data-view]');
 if(!target||target.closest('.sm-canvas'))return;
 if(target.dataset.view){view=target.dataset.view==='list'?'list':'stars';render();return;}
 if(target.dataset.subject!==undefined){setSubject(target.dataset.subject);return;}
 if(target.dataset.topic){
  const topic=getTopic(target.dataset.topic);if(!topic)return;
  const fromGuide=!!target.closest('#topic-detail');
  if(topic.id===selected?.id){if(fromGuide)scrollToEl(el('#starmap'));return;}
  select(topic,{focusKey:`topic:${topic.id}`,scroll:fromGuide});
  return;
 }
 const action=target.dataset.action;
 if(action==='clear')clearFilters();
 else if(action==='known'&&selected)toggleKnown(selected.id);
 else if(action==='guide')openGuide();
 else if(action==='back')back();
 else if(action==='all'){subject='';onFilter();}
 else if(action==='subject'){el<HTMLInputElement>('#topic-search').value='';el<HTMLSelectElement>('#year-filter').value='';el<HTMLInputElement>('#nz-only').checked=false;onFilter();}
 else if(action==='field'){if(selected)back();}
 else if(action==='more'){pageSize+=PAGE;render();}
 else if(action==='copy')copyPrompt(target);
 else if(action==='link'&&selected)void copy(`${location.origin}${location.pathname}#map?topic=${encodeURIComponent(selected.id)}`,target);
}
export function setupExplorer(){
 map=new StarMap(el('#starmap-stage'),{activate,escape:()=>{if(selected)back();},layout:()=>render()});
 el('#topic-search').addEventListener('input',onFilter);
 el('#year-filter').addEventListener('change',onFilter);
 el('#nz-only').addEventListener('change',onFilter);
 el('#clear-filters').addEventListener('click',clearFilters);
 el('#clear-known').addEventListener('click',()=>{known.clear();try{localStorage.removeItem('nz-known-topics');}catch{}render();});
 el('#map').addEventListener('click',onClick);
 window.addEventListener('popstate',onPop);
 window.addEventListener('hashchange',onHashChange);
 window.addEventListener('site-language-change',()=>render());
 setupGraphStats();
 const linked=applyHash();
 syncUrl(false);render();
 if(linked)requestAnimationFrame(()=>scrollToEl(el('#map')));
}
