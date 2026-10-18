# NZ curriculum context and editorial scope

Source check: 18 October 2026. This project includes 16 original family-learning activities and a maths supplement with 264 additional topics and 152 enriched existing topics, spanning Years 0–13. It does not provide a complete NZ curriculum mapping. All new year bands, activities, evidence prompts and prerequisite links are editorial drafts, have not been reviewed by a New Zealand teacher, and do not constitute official assessment or Ministry endorsement.

## Curriculum pathway and timing

The first overlay supports families using the English-medium New Zealand Curriculum (NZC), Years 0–10. Te Marautanga o Aotearoa is a distinct curriculum pathway; the presence of Māori words and contexts does not establish coverage of Māori-medium education. Families should check classroom priorities with their child's teacher.

[Maths and Statistics Years 0–10](https://newzealandcurriculum.tahurangi.education.govt.nz/nzc---mathematics-and-statistics-phases-1-4-years-0-10/5637289330.p) and [English Years 0–10](https://newzealandcurriculum.tahurangi.education.govt.nz/nzc---english-years-0-6/5637239089.p) took effect on 1 January 2026. The mathematics sequence covers Number, Algebra, Measurement, Geometry, Statistics and Probability. Phases are Years 0–3, 4–6, 7–8 and 9–10. The overlay retains upstream subject/domain names for interoperability; these labels are not a full representation of official NZ strands.

[Science and Social Sciences final content was released on 12 August 2026](https://newzealandcurriculum.tahurangi.education.govt.nz/y0-10-science-social-sciences-released). The individual [Science page](https://newzealandcurriculum.tahurangi.education.govt.nz/new-zealand-curriculum-online/nzc---science-phases-1-4-years-0-10/5637290855.p) and [Social Sciences page](https://newzealandcurriculum.tahurangi.education.govt.nz/new-zealand-curriculum-online/nzc---social-sciences-phases-1-4-years-0-10/5637290851.p) currently describe publication in the Gazette as pending and indicate use from January 2027. The latter records an update dated 16 September 2026. Published final content and legal implementation status must remain distinct. These pages should not be described as current consultation drafts or as already in-force 2026 requirements.

[The revised Ministry timeline](https://www.education.govt.nz/news/new-timeframe-years-0-8-final-national-curriculum) places remaining Years 0–8 learning areas in 2029 and all Years 9–10 learning areas in 2027. The original activity overlay does not cover senior qualifications. The separate maths supplement maps current senior NZC levels and NCEA standards; see [maths integration](maths-integration.md). Review source status when expanding the dataset or when official implementation changes.

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
