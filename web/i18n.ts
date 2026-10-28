import heroChinese from './zh-hero';
import staticChinese from './zh-static';
import dynamicChinese from './zh-dynamic';

type Language = 'en' | 'zh';
/** For text rendered by scripts, including SVG labels that the page translator skips. */
export const currentLanguage = (): Language => document.documentElement.lang === 'zh-CN' ? 'zh' : 'en';
export const t = (en: string, zh: string) => currentLanguage() === 'zh' ? zh : en;
const chinese: Record<string, string> = {...staticChinese, ...dynamicChinese, ...heroChinese};
const excluded = '[translate="no"],code,pre,script,style,svg';
const normalise = (text: string) => text.trim().replace(/\s+/g, ' ');

export function translated(text: string, language: Language): string {
 if (language === 'en') return text;
 const key = normalise(text);
 let value = chinese[key];
 if (!value) {
  const results = key.match(/^([\d,]+) topics?( with a suggested NZ year)?$/);
  const known = key.match(/^(\d+) topics? marked as understood on this browser$/);
  if (results) value = `${results[1]} 个知识点${results[2] ? '（有建议的新西兰年级）' : ''}`;
  if (known) value = `此浏览器已将 ${known[1]} 个知识点标记为已掌握`;
 }
 return value ? text.replace(text.trim(), value) : text;
}

export function setupLanguage() {
 const select = document.querySelector<HTMLSelectElement>('#site-language')!;
 let language: Language = 'en';
 try { language = localStorage.getItem('nz-site-language') === 'zh' ? 'zh' : 'en'; } catch { /* Preference storage is optional. */ }
 const originals = new WeakMap<Text, {source: string; rendered: string}>();
 const attributes = new WeakMap<Element, Map<string, {source: string; rendered: string}>>();
 const title = document.title;
 const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')!;
 const englishDescription = description.content;
 const apply = () => {
  observer.disconnect();
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en-NZ';
  document.title = language === 'zh' ? 'Learning Paths NZ：探索跨学科知识星图' : title;
  description.content = language === 'zh' ? '探索跨学科知识星图，查找基础知识，并结合 AI 安排下一步学习。适合新西兰家庭和学习者。' : englishDescription;
  select.value = language;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
   const node = walker.currentNode as Text;
   if (!node.textContent?.trim() || node.parentElement?.closest(excluded)) continue;
   const previous = originals.get(node);
   const source = previous && node.data === previous.rendered ? previous.source : node.data;
   const rendered = translated(source, language);
   if (node.data !== rendered) node.data = rendered;
   originals.set(node, {source, rendered});
  }
  for (const element of document.querySelectorAll<HTMLElement>('[placeholder],[aria-label],[title]')) {
   if (element.closest(excluded)) continue;
   const saved = attributes.get(element) || new Map();
   for (const attribute of ['placeholder', 'aria-label', 'title']) {
    const current = element.getAttribute(attribute);
    if (!current) continue;
    const previous = saved.get(attribute);
    const source = previous && current === previous.rendered ? previous.source : current;
    const rendered = translated(source, language);
    if (current !== rendered) element.setAttribute(attribute, rendered);
    saved.set(attribute, {source, rendered});
   }
   attributes.set(element, saved);
  }
  observer.observe(document.body, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title']});
 };
 const observer = new MutationObserver(apply);
 select.addEventListener('change', () => {
  language = select.value === 'zh' ? 'zh' : 'en';
  try { localStorage.setItem('nz-site-language', language); } catch { /* Keep switching available without storage. */ }
  apply();
  window.dispatchEvent(new Event('site-language-change'));
 });
 apply();
}
