# Mathematics integration — 18 October 2026

This records the initial import. The subsequent [maths curation](maths-curation.md) supersedes its provisional overlap decisions and runtime totals: the graph at that maths-curation revision had 1,859 topics, 3,981 edges and 458 diagnostic questions. The imported archive remains unchanged.

The previous site had 1,606 topics but only 16 NZ activity year bands, no Year 11–13 filter, and no support for the supplied diagnostic answers, graduated hints or scoped NZ curriculum mappings. The existing overlay also inferred hard dependencies from every `prerequisiteIds` entry. A research profile identified an upstream name/content mismatch in `mt_tAJH5BrpOx` (triangle angles versus area/volume).

## Imported evidence

All 22 package files are stored verbatim in `data/nz-maths/`, with the original README, SHA256 manifest, baseline snapshot, 300 numeric checks and validator. The original ZIP is retained locally under `artifacts/maths-supplement-2026-10-18/`. Archive CRC and all 21 checksummed source files passed. The six repository files researched by the package exactly matched HEAD before this change.

The initial integration contained 1,870 topics and 4,004 unique dependency pairs. There were 264 new topics, 152 enriched existing topics, 73 additional existing topics with mappings only, 454 diagnostic questions across 416 profiles, 812 supplement dependency records and 1,287 scoped mappings. These reference 33 achievement standards and two limited-scope unit standards.

## Import decisions

- Preserve upstream files, IDs, ages and international standard references. Apply supplied names, descriptions and pedagogy in the runtime view; keep original names and descriptions searchable. New topics have null ages, rather than school-year-derived ages.
- Retain `nzm_graphical_equation_solutions` as a distinct extension: it treats general intersections, domain restrictions and limits of a finite graph window. `mt_Yw27nweoTj` covers linear/quadratic estimation. This preserves both specific skills and every external reference. The original manual-review record remains untouched as source evidence; this is the maintainer import decision.
- Keep nine legacy overlap groups as existing identities. Coordinates, transformations, fractions, ratio, probability and scatterplot skills have inherited references and differing scopes. This import does not claim their consolidation is resolved.
- Normalize legacy `soft` to `helpful`. Merge dependency records by prerequisite/topic endpoints and apply the supplement's documented strength revisions and mathematical reasons. Keep basis, confidence, source IDs and locators. Only hard edges drive learning paths and readiness. Helpful cycles are allowed; hard cycles are rejected by tests.
- Preserve standards and framework entities separately. `get_curriculum_context` provides them with exact mappings and explicit coverage gaps. `get_topic` retains all diagnostic applicability, answers, hints, activities and forward connections. Prerequisite results preserve evidence metadata. Responses include only referenced sources.
- Year search uses profile placement and current mapping labels. Senior NZC levels receive typical search bands; NCEA qualification levels never assign school years. Phase 1 retains time-in-school labels; Years 0/1 are retrieval bands, not a fixed equivalence. Each mapping's notes define its scope.
- Keep the research-draft status. No teacher moderation or official assessment status is inferred from structural validation.

## User experience

The bilingual hero starts with a Year 10 parent's concrete wrong-answer question and a learner exploring Pythagoras. It explains checking foundations before practice and returning to the original question. Reporting terminology links to Ministry guidance and distinguishes NCEA Not Achieved.

The explorer supports Years 0–13, optional hints before answers, full curriculum scopes and source locators. The large graph loads when the map approaches the viewport or a search is requested; homepage guidance and language controls load separately.

## Validation and limits

The supplied validator was independently rerun: zero errors/warnings, all 300 numeric checks pass. Runtime tests cover endpoint integrity, unique pairs, hard DAG, required-path ordering, preserved NZ activity search, senior-to-foundation connectivity, 33 standards, and MCP delivery of pedagogy/context/evidence. Original data checksums, typecheck and production build pass. Browser checks cover English/Chinese, desktop/mobile, Pythagoras search, Year 13 chain-rule search, hint disclosure and curriculum details.

Remaining research gaps include the Year 6 calendar comparison activity, full AS91946 integrated assessment calibration, circle-theorem scope interpretation, legacy identity overlaps, and future Phase 5/Scholarship/vocational pathways. There has been no classroom trial or independent teacher moderation. The report's coverage counts must not be presented as 100% national-curriculum or assessment coverage. Other subjects have not been comprehensively revised in this change.
