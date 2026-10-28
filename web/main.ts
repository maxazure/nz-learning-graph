import {setupLanguage} from './i18n';
import {setupConnections} from './connections';
import {setupParentVideo} from './parent-video';
setupLanguage();setupConnections();setupParentVideo();
let explorerReady:Promise<typeof import('./explorer')>|undefined;
function loadExplorer(){return explorerReady??=import('./explorer').then(m=>{m.setupExplorer();return m;});}
const mapObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){void loadExplorer();mapObserver.disconnect();}},{rootMargin:'500px'});
mapObserver.observe(document.querySelector('#map')!);
if(location.hash.startsWith('#map')||location.hash.includes('topic='))void loadExplorer();
// Shared star map links (#map?topic=…) have no matching element, so the explorer handles them.
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#map?'))void loadExplorer();});
// The hero sky is drawn from the live graph once the page is idle; skipped when the reader asks to save data.
const saveData=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData;
if(!saveData)window.addEventListener('load',()=>{const draw=()=>void import('./constellation').then(m=>m.setupGraphStats());if(typeof requestIdleCallback==='function')requestIdleCallback(draw,{timeout:4000});else setTimeout(draw,1500);},{once:true});
const hero=document.querySelector<HTMLFormElement>('#hero-search')!;
async function search(value:string){const explorer=await loadExplorer();explorer.searchFor(value);document.querySelector('#map')!.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
hero.onsubmit=e=>{e.preventDefault();search(document.querySelector<HTMLInputElement>('#q')!.value);};
document.querySelectorAll<HTMLButtonElement>('[data-q]').forEach(b=>b.onclick=()=>search(b.dataset.q!));
const menu=document.querySelector<HTMLButtonElement>('.menu-btn')!;
menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('#nav-links')!.classList.toggle('open',open);};
document.querySelectorAll('#nav-links a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');document.querySelector('#nav-links')!.classList.remove('open');}));
