import {test} from 'node:test';
import assert from 'node:assert/strict';
import {curriculumPackages} from '../lib/nz-curriculum';

/** Page boundaries from the contents pages of the Ministry's August/September
 * 2026 PDFs, checked 29 October 2026. These independently check that an
 * editorial locator points into the stated phase and strand; they cannot
 * establish whether its teaching claim matches the individual year column. */
type PageRange = readonly [number,number];
const phasePages:Record<string,Record<number,Record<string,PageRange>>>={
 Science:{1:{'Physical Science':[9,10],'Biological Science':[11,12]},2:{'Physical Science':[14,15],'Biological Science':[16,17]},3:{'Physical Science':[19,20],'Biological Science':[21,22]},4:{'Physical Science':[24,28],'Biological Science':[29,31]}},
 'Social Sciences':{1:{'Civics and Society':[9,9],History:[10,12],Geography:[13,14],'Financial and Economic Activity':[15,15]},2:{'Civics and Society':[17,18],History:[19,24],Geography:[25,26],'Financial and Economic Activity':[27,28]},3:{'Civics and Society':[30,31],History:[32,34],Geography:[35,36],'Financial and Economic Activity':[37,38]},4:{'Civics and Society':[40,41],History:[42,47],Geography:[48,50],'Financial and Economic Activity':[51,52]}},
 'The Arts':{1:{Dance:[9,10],Drama:[11,11],Music:[12,13],'Visual Arts':[14,14]},2:{Dance:[16,16],Drama:[17,17],Music:[18,19],'Visual Arts':[20,20]},3:{Dance:[22,22],Drama:[23,23],Music:[24,25],'Visual Arts':[26,26]},4:{Dance:[28,29],Drama:[30,31],Music:[32,34],'Visual Arts':[35,35]}},
 'Health and Physical Education':{1:{Health:[9,10],'Physical Education':[11,12]},2:{Health:[14,16],'Physical Education':[17,18]},3:{Health:[20,21],'Physical Education':[22,23]},4:{Health:[25,27],'Physical Education':[28,29]}},
 Technology:{1:{'Design, Make, and Innovate':[9,9]},2:{'Design, Make, and Innovate':[11,11]},3:{'Design, Make, and Innovate':[13,13],'Materials Technology (Resistant and Textiles)':[14,14],'Food and Processing Technology':[15,15],'Systems and Control':[16,16],'Digital Technology':[17,17]},4:{'Design, Make, and Innovate':[19,19],'Spatial and Product Design':[20,20],'Materials Technology (Resistant and Textiles)':[21,21],'Food and Processing Technology':[22,22],'Systems and Control':[23,23],'Digital Technology':[24,24]}},
};
// Start pages of Novice 1, 2 and 3, then one past the document's last page.
const novicePages:Record<string,readonly [number,number,number,number]>={
 nzc_reo_2026:[8,12,14,17],nzc_mandarin_2026:[8,12,16,19],nzc_nzsl_2026:[8,13,18,23],
 nzc_samoa_2026:[8,11,15,18],nzc_tokelau_2026:[8,12,15,17],nzc_tonga_2026:[8,12,16,19],
 nzc_cook_2026:[8,12,15,17],nzc_niue_2026:[8,11,14,18],nzc_japanese_2026:[8,13,17,21],
 nzc_korean_2026:[8,12,14,17],nzc_french_2026:[8,11,13,16],nzc_german_2026:[8,12,15,18],nzc_spanish_2026:[8,11,13,16],
};
const documentEnd:Record<string,number>={nzc_science_2026:32,nzc_social_2026:53,nzc_arts_2026:36,nzc_health_2026:30,nzc_technology_2026:25,nzc_languages_2026:4};
for(const [id,starts] of Object.entries(novicePages))documentEnd[id]=starts[3]-1;
const phaseYears:Record<number,PageRange>={1:[0,3],2:[4,6],3:[7,8],4:[9,10]};

function citedPages(locator:string):PageRange[]{
 const match=locator.match(/\bPDF\s+p{1,2}\.\s*([\d\s,–—-]+)/i);
 if(!match)return [];
 return [...match[1].matchAll(/(\d+)(?:\s*[-–—]\s*(\d+))?/g)].map(m=>[Number(m[1]),Number(m[2]||m[1])]);
}
const overlaps=([a,b]:PageRange,[c,d]:PageRange)=>a<=d&&b>=c;

test('curriculum coverage records agree with each topic’s subject, phase and suggested years',()=>{
 for(const pkg of curriculumPackages){
  const byId=new Map(pkg.topics.map(t=>[t.id,t])),ownSources=new Set(pkg.sources.map(s=>s.id));
  for(const t of pkg.topics){
   assert.ok(ownSources.has(t.sourceId),`${t.id}: source belongs to a different learning area`);
   if(pkg.subject==='Learning Languages'){assert.deepEqual(t.years,[],`${t.id}: proficiency is not a school year`);continue;}
   const phase=Number(t.phase.match(/^Phase ([1-4])\b/)?.[1]);
   assert.ok(phaseYears[phase],`${t.id}: unknown phase`);
   const [first,last]=phaseYears[phase];
   assert.ok(t.years.length>0&&t.years.every(year=>year>=first&&year<=last),`${t.id}: years fall outside ${t.phase}`);
   // A later "building on Year …" reference is context, not the topic's scope.
   const scopedYear=t.locator.match(/(?:>|;|,)\s*Year\s+(\d{1,2})\b/i);
   if(scopedYear)assert.ok(t.years.includes(Number(scopedYear[1])),`${t.id}: cited year ${scopedYear[1]} is not in its suggested years`);
   if(pkg.subject==='English')assert.equal(t.sourceId,`nzc_english_phase${phase}`,`${t.id}: English phase source mismatch`);
  }
  for(const c of pkg.coverage){
   assert.ok(ownSources.has(c.sourceId),`${pkg.subject}: coverage uses another area's source`);
   for(const id of c.topicIds){
    const t=byId.get(id);assert.ok(t,`${id}: unknown coverage topic`);
    assert.equal(t.phase,c.phase,`${id}: coverage phase mismatch`);
    assert.equal(t.domain,c.strand,`${id}: coverage strand mismatch`);
    assert.ok(t.years.every(y=>c.years.includes(y)),`${id}: coverage years omit a suggested year`);
   }
  }
 }
});

test('PDF page locators land in the cited phase and learning area',()=>{
 for(const pkg of curriculumPackages.filter(p=>p.subject!=='English'))for(const t of pkg.topics){
  const pages=citedPages(t.locator),end=documentEnd[t.sourceId];
  // A glossary-only item is explicitly marked as unverified instead of a PDF claim.
  if(!pages.length){assert.match(t.locator,/not yet checked against the language-specific teaching sequence/i,`${t.id}: no PDF locator or documented exception`);continue;}
  assert.ok(end,`${t.id}: no checked PDF page count`);
  assert.ok(pages.every(([a,b])=>a>=1&&a<=b&&b<=end),`${t.id}: page number outside source PDF`);
  const phase=Number(t.phase.match(/^(?:Phase|Novice) ([1-4])\b/)?.[1]);
  let target:PageRange|undefined;
  if(pkg.subject==='Learning Languages'){
   const starts=novicePages[t.sourceId];
   if(starts)target=[starts[phase-1],starts[phase]-1];
  }else target=phasePages[pkg.subject]?.[phase]?.[t.domain];
  if(target)assert.ok(pages.some(p=>overlaps(p,target!)),`${t.id}: ${t.locator} does not reach ${pkg.subject} ${t.phase} / ${t.domain}`);
  else assert.equal(t.sourceId,'nzc_languages_2026',`${t.id}: no official page range for this scope`);
 }
});
