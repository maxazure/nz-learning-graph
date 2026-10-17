import {setupLanguage} from './i18n';
import {setupAccount} from './account';
import {setupExplorer} from './explorer';
import {setupConnections} from './connections';
setupExplorer();setupAccount();setupConnections();setupLanguage();
const hero=document.querySelector<HTMLFormElement>('#hero-search')!;
function search(value:string){document.querySelector<HTMLSelectElement>('#subject-filter')!.value='';document.querySelector<HTMLSelectElement>('#year-filter')!.value='';document.querySelector<HTMLInputElement>('#nz-only')!.checked=false;const field=document.querySelector<HTMLInputElement>('#topic-search')!;field.value=value;field.dispatchEvent(new Event('input'));document.querySelector('#map')!.scrollIntoView({behavior:'smooth'});}
hero.onsubmit=e=>{e.preventDefault();search(document.querySelector<HTMLInputElement>('#q')!.value);};
document.querySelectorAll<HTMLButtonElement>('[data-q]').forEach(b=>b.onclick=()=>search(b.dataset.q!));
const menu=document.querySelector<HTMLButtonElement>('.menu-btn')!;
menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('#nav-links')!.classList.toggle('open',open);};
document.querySelectorAll('#nav-links a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');document.querySelector('#nav-links')!.classList.remove('open');}));
document.querySelector('.nav-actions .btn-quiet')?.addEventListener('click',()=>document.querySelector<HTMLButtonElement>('[data-auth-mode="login"]')!.click());
