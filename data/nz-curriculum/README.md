# NZ curriculum supplement

This directory contains editorial learning topics and connections based on the published English-medium New Zealand Curriculum. The original Ministry documents are linked in the source records and are not redistributed here. Source locators describe the published strand, phase and, where checked, page or year. Teaching explanations, examples, questions, answers, activities, mappings and graph connections are created for this project and have not been teacher moderated. They are not official assessment tasks or mandatory prerequisite chains.

English and mathematics Years 0–10 are in effect from 1 January 2026. The published 2026 Science and Social Sciences content is proposed for use from 2027, with the stated transition arrangements. The Arts, Health and Physical Education and Technology are proposed for Years 9–10 from 2027 and Years 0–8 from 2029, with transition arrangements. These published statements were awaiting Gazette publication when checked on 29 October 2026. Learning Languages is optional; if a school offers it, the new documents have proposed use dates of 2027 for Years 9–10 and 2029 for Years 0–8. Novice stages are proficiency based, so no school year is inferred from them. Te Marautanga o Aotearoa is a separate pathway and is not represented by an English-medium mapping.

The `coverage` entries identify strand/phase areas represented by one or more topics. They are a navigation and review aid, not a claim that every year-by-year statement, language sequence, standard, teaching resource or learning need has been mapped. Per-area `limitations` record known gaps. School year bands are broad editorial search aids; consult the linked source and the learner's teacher for the exact teaching sequence.

## Attribution and terms

The New Zealand Ministry of Education's [Tāhūrangi copyright notice](https://newzealandcurriculum.tahurangi.education.govt.nz/copyright) says that Crown copyright material on the site is generally licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/), subject to stated exceptions, including third-party and imagery rights. Curriculum-derived material in this supplement is made available for non-commercial reuse with attribution to the Ministry of Education and this project, subject to those source exceptions. It must not be represented as Ministry-endorsed. The original Marble-authored topic text remains separately licensed CC BY-SA 4.0; do not assume the curriculum supplement is available for unrestricted commercial reuse. Code remains under LICENSE-CODE. See [PROVENANCE.md](../../PROVENANCE.md) for the wider dataset.

## Files

- `english.json`, `science.json`, `social.json`, `arts.json`, `health.json`, `technology.json` and `languages.json` contain sources, topics, suggested edges, strand/phase coverage and limitations.
- `bridges.json` records explicitly justified suggested cross-subject connections. `helpful` links may support learning but are not mandatory prerequisites.
- Optional topic `resources` link to separately attributed activity materials; their own publishers' terms apply. External videos and other media are not bundled.
- `npm run validate` checks source IDs, required teaching fields, coverage references and edge endpoints. `npm test` checks the combined runtime graph and MCP. Structural checks do not establish teaching accuracy.
