import {setupLanguage} from './i18n';
import {setupConnections} from './connections';
import {setupParentVideo} from './parent-video';
setupLanguage();setupConnections();setupParentVideo();
let explorerReady:Promise<void>|undefined;
function loadExplorer(){return explorerReady??=import('./explorer').then(m=>m.setupExplorer());}
const mapObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){void loadExplorer();mapObserver.disconnect();}},{rootMargin:'500px'});
mapObserver.observe(document.querySelector('#map')!);
if(location.hash.startsWith('#map')||location.hash.includes('topic='))void loadExplorer();
const hero=document.querySelector<HTMLFormElement>('#hero-search')!;
async function search(value:string){await loadExplorer();document.querySelector<HTMLSelectElement>('#subject-filter')!.value='';document.querySelector<HTMLSelectElement>('#year-filter')!.value='';document.querySelector<HTMLInputElement>('#nz-only')!.checked=false;const field=document.querySelector<HTMLInputElement>('#topic-search')!;field.value=value;field.dispatchEvent(new Event('input'));document.querySelector('#map')!.scrollIntoView({behavior:'smooth'});}
hero.onsubmit=e=>{e.preventDefault();search(document.querySelector<HTMLInputElement>('#q')!.value);};
document.querySelectorAll<HTMLButtonElement>('[data-q]').forEach(b=>b.onclick=()=>search(b.dataset.q!));
const menu=document.querySelector<HTMLButtonElement>('.menu-btn')!;
menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('#nav-links')!.classList.toggle('open',open);};
document.querySelectorAll('#nav-links a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');document.querySelector('#nav-links')!.classList.remove('open');}));
