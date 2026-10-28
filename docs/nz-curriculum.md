# NZ curriculum context and editorial scope

Source check: 29 October 2026. The project includes 16 original family-learning activities, a mathematics supplement spanning Years 0–13, and a new Years 0–10 supplement across the other English-medium NZC learning areas. Strand-and-phase coverage entries identify represented areas; they do not establish complete statement-by-statement curriculum coverage. Year bands, activities, questions and prerequisite links are editorial drafts, have not been reviewed by a New Zealand teacher, and do not constitute official assessment or Ministry endorsement.

## Curriculum pathway and timing

The first overlay supports families using the English-medium New Zealand Curriculum (NZC), Years 0–10. Te Marautanga o Aotearoa is a distinct curriculum pathway; the presence of Māori words and contexts does not establish coverage of Māori-medium education. Families should check classroom priorities with their child's teacher.

[Maths and Statistics Years 0–10](https://newzealandcurriculum.tahurangi.education.govt.nz/nzc---mathematics-and-statistics-phases-1-4-years-0-10/5637289330.p) and [English Years 0–10](https://newzealandcurriculum.tahurangi.education.govt.nz/nzc---english-years-0-6/5637239089.p) took effect on 1 January 2026. The mathematics sequence covers Number, Algebra, Measurement, Geometry, Statistics and Probability. Phases are Years 0–3, 4–6, 7–8 and 9–10. The overlay retains upstream subject/domain names for interoperability; these labels are not a full representation of official NZ strands.

[Science and Social Sciences final content was released on 12 August 2026](https://newzealandcurriculum.tahurangi.education.govt.nz/y0-10-science-social-sciences-released). The individual [Science page](https://newzealandcurriculum.tahurangi.education.govt.nz/new-zealand-curriculum-online/nzc---science-phases-1-4-years-0-10/5637290855.p) and [Social Sciences page](https://newzealandcurriculum.tahurangi.education.govt.nz/new-zealand-curriculum-online/nzc---social-sciences-phases-1-4-years-0-10/5637290851.p) currently describe publication in the Gazette as pending and indicate use from January 2027. The latter records an update dated 16 September 2026. Published final content and legal implementation status must remain distinct. These pages should not be described as current consultation drafts or as already in-force 2026 requirements.

[The revised Ministry timeline](https://www.education.govt.nz/news/new-timeframe-years-0-8-final-national-curriculum) places remaining Years 0–8 learning areas in 2029 and all Years 9–10 learning areas in 2027. The new non-mathematics supplement focuses on Years 0–10; it does not cover senior qualifications. The separate maths supplement maps current senior NZC levels and NCEA standards; see [maths integration](maths-integration.md). Review source status when expanding the dataset or when official implementation changes.


## Other learning areas and the star map (29 October 2026)

The published NZC Years 0–10 documents now cover English, Science, Social Sciences, The Arts, Health and Physical Education, Technology and Learning Languages as well as mathematics. English Years 0–10 is in effect. The Ministry describes the revised Science and Social Sciences content as proposed National Curriculum Statements to start from 2027; the other published documents are proposed to start in Years 9–10 from 2027 and Years 0–8 from 2029, with transition arrangements. Gazette publication remained pending on the linked learning-area pages when checked. For exact school-specific dates see the [Ministry timeline](https://tahurangi.education.govt.nz/years-0-10-curriculum).

Learning Languages is optional, although schools are encouraged to offer it in Years 7–10. Where offered, the proposed dates apply. Its Novice 1–3 sequences describe proficiency, not school year; these topics intentionally have no assigned year. The supplement includes general topics and examples across all 13 language pathways. Their published teaching sequences were consulted, alongside language overview and glossary pages. Where checked, records include a PDF page and proficiency level; the Gagana Tokelau intergenerational topic was re-scoped to Novice 3 using the language document's introduction. Detailed line-by-line requirements, complete language-specific sequences and senior non-mathematics pathways are not fully mapped.

See [the supplement](../data/nz-curriculum/README.md) for sources, scope, licences and limitations, and `coverage` and `limitations` in each area file. Connections to other subjects are editorial teaching suggestions, with a reason and source, not official mandated prerequisites. The interactive star map draws its nodes, links and counts from the same active graph used by MCP and current open-data exports. A full list remains available alongside the visualisation.

The Ministry's [copyright notice](https://newzealandcurriculum.tahurangi.education.govt.nz/copyright) generally applies CC BY-NC 4.0 to Crown website material, with exceptions. Curriculum-derived supplement content is attributed and identified for non-commercial reuse; original Marble content remains separately licensed under its own terms. See [provenance](../PROVENANCE.md).

### Learning-path scope review

The 29 October 2026 review checked inherited prerequisite links against the particular teaching scopes attached to their endpoints. The Earth rotation topic was aligned to the Year 4 Science sequence. Seven inherited hard links were removed where a broad later topic would have blocked an earlier, narrower activity; five have a more appropriately directed helpful link with a stated reason. A new Year 6 inherited-trait foundation supports the Year 8 introduction to natural selection without requiring the Year 10 molecular genetics topic. These are unmoderated pedagogical decisions, recorded with source locators in [dependency reviews](../data/nz-curriculum/dependency-reviews.json); the original archives are unchanged.

Regression tests check the full required-path graph for mapped year bands that run entirely backwards. Suggested bands are editorial retrieval aids, so this check is a signal of inconsistency and does not prove the teaching order or completeness of the curriculum mapping.

## What the source links establish

The source registry in `data/nz-overlay.json` records exact URLs, status and the date checked. Curriculum links establish broad learning-area context. They do not verify that an original activity belongs in a particular school year or that its proposed prerequisites are mandatory. `mappingStatus: editorial-draft` and `teacherReviewed: false` apply independently of the official source's status. Empty `standards` arrays intentionally avoid invented official outcome identifiers.

The [official parent portal](https://www.education.govt.nz/your-childs-learning) helps families compare the activities with school learning. [DOC animal information](https://www.doc.govt.nz/nature/native-animals/) and [plant information](https://www.doc.govt.nz/plants) support species-specific fact checking. [Te Papa's regional Matariki guide](https://www.tepapa.govt.nz/digital-museum/explore-digital-museum/matariki-maori-new-year/matariki-regional-variations) supports acknowledging variation, including Puanga traditions. Do not present one account as universal across iwi.

[The historical Māori history guidance](https://newzealandcurriculum.tahurangi.education.govt.nz/5637169484.p) is contextual material from the earlier curriculum, not proof of a 2027 year-by-year mapping. Local histories, place-name explanations and cultural accounts must be attributed to reliable sources, including relevant mana whenua sources when available. AI must not invent whakapapa, local traditions or authoritative tikanga guidance.

## Original activity overlay design

The original activity overlay IDs begin `nz_`. Each topic adds two prerequisites pointing to real IDs in the upstream `data/topics.json`. No new topic depends on another new topic, and no upstream edge is changed, so adding the overlay cannot introduce a directed cycle into an acyclic upstream graph. The 32 links are pedagogical suggestions, not empirically validated dependencies.

`ageRangeStart` and `ageRangeEnd` are broad display estimates derived from suggested years; they are not placement tests. `centrality: 0` is an unset ranking placeholder, not a computed graph statistic. A future combined-graph build can calculate centrality. Activities span NZD money, metric measures, fractions, timetables, budgets, data, maps, biodiversity, catchments, seasonal observation, historical sources and community decisions. They do not replace or silently re-label the 1,590 upstream topics; upstream content may retain non-NZ assumptions.

Use invented and clearly labelled prices, weather and survey data unless a dated public source is provided. The activities are parent-led. No account needs a child's legal name, school, address, birth date or health information. A nickname and approximate year group are sufficient. Home practice evidence must not be presented as school grades, official curriculum attainment or a diagnosis. MCP responses should retain source references and the editorial-review status.

## Review before claiming alignment

A qualified reviewer would need to check each exact year-level statement, prerequisite, activity and accessibility requirement; record the reviewer and date; and resolve corrections before any topic is labelled teacher-reviewed. This has not occurred in the initial release. Future review should also inspect upstream UK-specific money, spelling and curriculum assumptions rather than treating the original graph as an NZ syllabus.

## Verification performed

The overlay was parsed as JSON; all 16 topic IDs and 10 source IDs are unique; all 32 prerequisite references resolve to upstream topics; every source reference resolves; every topic has draft/unreviewed flags and no asserted standards. These structural checks do not establish pedagogical validity.

## Mathematics supplement (2026-10-18)

The 22-file research package is preserved unchanged in `data/nz-maths/`. Its [research report](../data/nz-maths/research-report.md), [mapping contract](../data/nz-maths/schema.md) and [coverage matrix](../data/nz-maths/coverage-matrix.csv) distinguish current Years 0–10 teaching sequences, current senior NZC Levels 6–8 and current NCEA standards from future framework plans. The runtime retains exact mapping scopes, diagnostic applicability, source locators and research-draft flags. Suggested year bands are retrieval aids; they do not apply every diagnostic to every mapped year.

There are 1,287 mappings over 489 topics and 33 achievement standards. These counts do not establish complete curriculum or assessment coverage. [Import decisions and remaining gaps](maths-integration.md) describe what changed and what remains unreviewed.

For parent-facing reporting language, the [Ministry reporting guide](https://www.education.govt.nz/parents-and-caregivers/schools-year-0-13/parent-portal/guide-your-childs-reporting-and-progress) explains Emerging, Developing, Consolidating, Proficient and Exceeding, including mid-year versus end-year expectations. [NZQA assessment standards](https://www2.nzqa.govt.nz/qualifications-and-standards/about-standards/) use Not Achieved when the standard criteria are not met. The homepage separates these contexts.
