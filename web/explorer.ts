import {topics,dependencies,sources,subjects,getTopic,prerequisites,learningPath,type Topic} from '../lib/graph';
import {copy} from './account';
export const escape=(s:unknown)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const el=(s:string)=>document.querySelector<HTMLElement>(s)!;
let selected:Topic=topics.find(t=>t.id==='nz_sharing_kai_fairly')||topics.find(t=>t.nz)!;
let known=new Set<string>();
try{const saved=JSON.parse(localStorage.getItem('nz-known-topics')||'[]');if(Array.isArray(saved))known=new Set(saved.filter(id=>typeof id==='string'&&getTopic(id)));}catch{}
let pageSize=24;
function yearLabel(t:Topic){return t.nz?`Suggested Years ${Math.min(...t.nz.suggestedYears)}–${Math.max(...t.nz.suggestedYears)}`:`Approx. ages ${t.ageRangeStart}–${t.ageRangeEnd}`;}
export function setupExplorer(){
 el('#subject-filter').innerHTML='<option value="">All subjects</option>'+subjects.map(s=>`<option>${escape(s)}</option>`).join('');
 for(const selector of ['#topic-search','#subject-filter','#year-filter','#nz-only'])el(selector).addEventListener('input',()=>{pageSize=24;renderResults();});
 el('#clear-filters').onclick=()=>{document.querySelector<HTMLSelectElement>('#subject-filter')!.value='';document.querySelector<HTMLSelectElement>('#year-filter')!.value='';document.querySelector<HTMLInputElement>('#nz-only')!.checked=false;pageSize=24;renderResults();};
 el('#load-topics').onclick=()=>{pageSize+=24;renderResults();};
 el('#clear-known').onclick=()=>{known.clear();localStorage.removeItem('nz-known-topics');renderTopic();};
 const id=new URLSearchParams(location.hash.split('?')[1]||'').get('topic');if(id&&getTopic(id))selected=getTopic(id)!;
 renderResults();renderTopic();
}
function renderResults(){
 const q=(el('#topic-search') as HTMLInputElement).value.toLowerCase().trim();
 const subject=document.querySelector<HTMLSelectElement>('#subject-filter')!.value;
 const year=document.querySelector<HTMLSelectElement>('#year-filter')!.value;
 const nz=(el('#nz-only') as HTMLInputElement).checked;
 const filtered=topics.filter(t=>(!subject||t.subject===subject)&&(!nz||t.nz)&&(!year||t.nz?.suggestedYears.includes(Number(year)))&&q.split(/\s+/).filter(Boolean).every(w=>`${t.name} ${t.description} ${t.domain} ${t.nz?.localContext||''}`.toLowerCase().includes(w))).sort((a,b)=>Number(!!b.nz)-Number(!!a.nz)||b.centrality-a.centrality);
 el('#clear-filters').hidden=!subject&&!year&&!nz;
 el('#results-count').textContent=`${filtered.length.toLocaleString()} ${filtered.length===1?'topic':'topics'}${year?' with a suggested NZ year':''}`;
 el('#topic-results').innerHTML=filtered.length?filtered.slice(0,pageSize).map(t=>`<button translate="no" lang="en-NZ" class="topic-result ${t.id===selected.id?'selected':''}" data-topic="${t.id}" aria-pressed="${t.id===selected.id}"><span class="topic-subject">${escape(t.subject)}${t.nz?' · NZ context':''}</span><strong>${escape(t.name)}</strong><span>${yearLabel(t)} <span aria-hidden="true">↗</span></span></button>`).join(''):`<div class="empty-state"><p>${subject||year||nz?'No topics match these filters. Clear filters to search the full learning map. Year filters only include NZ activities with a suggested year; original topics are excluded.':'No matching topics. Try a shorter English search, such as time or fractions.'}</p></div>`;
 el('#load-topics').hidden=filtered.length<=pageSize;wireTopics(el('#topic-results'));
}
function wireTopics(root:HTMLElement){root.querySelectorAll<HTMLElement>('[data-topic]').forEach(b=>b.onclick=()=>{selected=getTopic(b.dataset.topic!)!;renderTopic();renderResults();el('#topic-detail').scrollIntoView({behavior:'smooth',block:'start'});});}
function renderTopic(){
 const direct=prerequisites(selected.id);const next=dependencies.filter(d=>d.prerequisiteId===selected.id).map(d=>getTopic(d.topicId)!);
 const path=learningPath(selected.id,[...known]);
 el('#topic-detail').innerHTML=`<div class="detail-heading"><span class="eyebrow">${escape(selected.subject)} / ${escape(selected.domain)}</span><h3>${escape(selected.name)}</h3><p>${escape(selected.description)}</p><span class="pill">${yearLabel(selected)}</span> <span class="pill draft">${selected.nz?'NZ editorial draft':'Original international topic'}</span></div>
 <div class="graph-heading"><h4>See how the ideas connect</h4><span>Tap an idea to explore it</span></div><div id="live-graph" class="live-graph"></div>
 <div class="detail-columns"><div><h4>Look for these signs of understanding</h4><ul>${selected.evidence.map(e=>`<li>${escape(e)}</li>`).join('')}</ul><div class="question-card"><span class="eyebrow">A question to try</span><p>${escape(selected.assessmentPrompt.replaceAll('{{name}}','your child'))}</p></div></div>
 <div><h4>${selected.nz?'Try it in Aotearoa':'Try it together'}</h4><p>${escape(selected.nz?.parentActivity||'Ask your child to explain their thinking with an everyday example. Offer one small hint, then let them try again.')}</p>${selected.nz?`<p>${escape(selected.nz.localContext)}</p><h4>Sources & review</h4><ul>${sources.filter(s=>selected.nz!.sourceIds.includes(s.id)).map(s=>`<li><a href="${escape(s.url)}" target="_blank" rel="noopener">${escape(s.title)} ↗</a></li>`).join('')}</ul>`:''}<p class="fine-print">${selected.nz?'Suggested year band and activity: editorial draft, not teacher reviewed.':'Original Marble age guidance; this topic has not been mapped to a NZ year level.'} Learning paths are suggestions, not a school assessment.</p></div></div>
 <details><summary>Before this: ${direct.length} suggested foundations</summary>${direct.length?direct.map(d=>`<div class="prerequisite"><button class="text-button" data-topic="${d.topic.id}">${escape(d.topic.name)}</button><span class="pill">${d.strength==='hard'?'Foundation':'Helpful extra'}</span><p>${escape(d.reason)}</p></div>`).join(''):'<p>This graph lists no earlier foundations for this topic.</p>'}</details>
 <div class="path-panel"><div><span class="eyebrow">Your practice sequence</span><h4>${path.steps.length?`${path.steps.length} steps, foundations first`:'You have marked this topic as understood'}</h4><p class="fine-print">Includes required foundations only. Helpful extras appear above. Based on topics you mark here, saved on this browser only.</p></div><button id="mark-known" class="button secondary">${known.has(selected.id)?'Mark as still practising':'Mark as understood'}</button><ol class="learning-steps">${path.steps.map(t=>`<li><button class="text-button" data-topic="${t.id}">${escape(t.name)}</button></li>`).join('')}</ol><button id="copy-lesson" class="button">Copy a prompt for your AI <span aria-hidden="true">↗</span></button></div>`;
 renderGraph(direct.map(d=>d.topic),next);wireTopics(el('#topic-detail'));
 el('#mark-known').onclick=()=>{known.has(selected.id)?known.delete(selected.id):known.add(selected.id);try{localStorage.setItem('nz-known-topics',JSON.stringify([...known]));}catch{}renderTopic();};
 el('#known-count').textContent=`${known.size} ${known.size===1?'topic':'topics'} marked as understood on this browser`;
 el('#copy-lesson').onclick=()=>{const prompt=`I am a parent supporting my child's learning in New Zealand. Use the Learning Paths NZ MCP tools to get topic ${selected.id} (${selected.name}), check its prerequisites and create a short learning path. Topics I have observed them understand: ${[...known].join(', ')||'not assessed yet'}. Ask me one question at a time to check understanding, then suggest a 10-minute activity. Give hints before answers. Cite topic IDs and the available sources. Treat NZ mappings as editorial drafts, not official assessment. Do not request identifying information about my child. If the MCP tools are unavailable, say so rather than inventing graph results.`;void copy(prompt,el('#copy-lesson'));};
}
function renderGraph(before:Topic[],after:Topic[]){
 const nodes=[...before.slice(0,4).map((t,i)=>({t,x:105,y:45+i*80,kind:'before'})),{t:selected,x:350,y:165,kind:'focus'},...after.slice(0,4).map((t,i)=>({t,x:595,y:45+i*80,kind:'after'}))];
 const lines=nodes.filter(n=>n.kind!=='focus').map(n=>n.kind==='before'?`<path d="M 190 ${n.y+23} C 235 ${n.y+23}, 215 188, 265 188"/>`:`<path d="M 435 188 C 480 188, 465 ${n.y+23}, 510 ${n.y+23}"/>`).join('');
 const svg=`<svg viewBox="0 0 700 355" role="group" aria-label="Prerequisite graph. Foundations on the left, selected topic in the middle, next topics on the right."><defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#a5b4a6"/></marker></defs><g fill="none" stroke="#a5b4a6" stroke-width="1.5" marker-end="url(#arrow)">${lines}</g><text x="20" y="16" class="graph-label">FOUNDATIONS</text><text x="265" y="16" class="graph-label">EXPLORING</text><text x="510" y="16" class="graph-label">WHAT COMES NEXT</text>${nodes.map(n=>{const words=n.t.name.split(' ');const rows:string[]=[''];for(const word of words){if((rows.at(-1)!.length+word.length)>21)rows.push(word);else rows[rows.length-1]+=(rows.at(-1)?' ':'')+word;}return `<g tabindex="0" role="button" aria-label="Explore ${escape(n.t.name)}" data-topic="${n.t.id}" class="graph-node ${n.kind}"><rect x="${n.x-85}" y="${n.y}" width="170" height="62" rx="9"/><text x="${n.x}" y="${n.y+22}" text-anchor="middle">${rows.slice(0,3).map((r,i)=>`<tspan x="${n.x}" dy="${i?15:0}">${escape(r)}${i===2&&rows.length>3?'…':''}</tspan>`).join('')}</text></g>`;}).join('')}</svg>`;
 el('#live-graph').innerHTML=svg+`<p class="fine-print">${before.length} foundations · ${after.length} next topics. Up to four shown on each side; all foundations are listed below.</p>`;
 el('#live-graph').querySelectorAll<SVGElement>('[data-topic]').forEach(n=>{n.onclick=()=>{selected=getTopic(n.dataset.topic!)!;renderTopic();renderResults();};n.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();n.dispatchEvent(new MouseEvent('click'));}};});
}
