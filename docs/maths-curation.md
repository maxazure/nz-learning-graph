# Mathematics consolidation and prerequisite review — 18 October 2026

The active website and MCP now share **1,859 topics and 3,981 unique dependency pairs** (2,648 required, 1,333 helpful). This revision consolidates 11 duplicate records, clarifies 119 headings, makes 42 explicit dependency decisions, and adds four targeted diagnostics. All 416 supplied teaching profiles, their original 454 diagnostics and all 1,287 scoped curriculum mappings remain available. There are now 458 diagnostics. The original Marble files and all 22 research-package files remain unchanged.

The review examined the supplement's ten overlap groups, then compared every repeated active mathematics heading after ignoring upstream age suffixes. Identical headings now have distinct scopes or a single consolidated record. Numeric ranges, representation methods and application goals remain separate where they change what the learner needs to demonstrate. Name uniqueness alone does not establish semantic uniqueness across the entire subject.

## Consolidated identities

| Skill | Retired source ID | Active ID |
|---|---|---|
| Four-quadrant coordinates | `mt_R4AY0LKxfl` | `mt_hVpGOEz2kG` |
| Rigid coordinate transformations | `mt_K0Y15w48SY` | `mt_SH7QgFl8-v` |
| Coordinate translation and reflection | `mt_efOeaGFyGM` | `mt_lxaM6iVpdr` |
| Probability scale | `mt_vmQJAtAFuy` | `mt_t0g2SlP404` |
| Total probability and complements | `mt_3fwYu7imd4` | `mt_XfyqXLqzpx` |
| Equivalent fractions with area/strip models | `mt_FP-mjXaq3B` | `mt_FbDKeLfBCo` |
| Basic angle facts | `mt_QDTO3GAgcq` | `mt_oqziWKry-L` |
| Ratio notation and equivalent ratios | `mt_yK51ZnKA8m` | `mt_XWSGuFW7It` |
| Fractions on a number line | `mt_NoB20kVa4w` | `mt_Kr3IyA6m-O` |
| Constructing and critiquing arguments | `mt_a3dov8CZkq` | `mt_pyMD_SIiYO` |
| Scaling decimals by powers of ten | `mt_wPgpMJ0-PA` | `mt_LlMl2PbaZe` |

The active record retains the members' original evidence and international standard references. Each curriculum mapping keeps its own ID, framework, year/phase, scope, status and source locator. Only its topic endpoint changes. Standard and curriculum-requirement references are also rewritten and deduplicated. `sourceTopicIds` records archival provenance; retired IDs are no longer active public identities or redirects. Existing browser marks for retired records are dropped rather than treated as proof of mastery of the combined skill.

Full reasons and the exact changes are in [`data/maths-curation.json`](../data/maths-curation.json). The raw sources retain each record's original age metadata; the active record uses the canonical record's age range. Suggested NZ years continue to come from scoped curriculum mappings and profile placement, never NCEA level numbers.

## Overlaps retained with explicit scope

- Area/strip equivalence, locating fractions on a number line, recognising coincident equivalent values, and generating equivalence by scaling are related but distinct demonstrations.
- Translating/reflection coordinates remains separate from the broader transformation record including rotations.
- Basic angle facts remain separate from combining several angle facts in one problem.
- Constructing a paired-data scatter plot remains separate from predicting from a supplied fitted trend.
- Reading approximate values from a supplied graph, constructing a quadratic graph, and solving intersections with domain/window restrictions remain separate. The former general “Estimating answers” record now explicitly handles reading values; equation solutions belong to the graphical-solving record.
- Whole-number ranges, supported versus independent problem solving, and specific mathematical representations remain explicit in the revised headings.

The repeated-heading audit also exposed mislabelled content: hundredths and thousandths were both called “Tenths”; triangle congruence was called “Angles in triangles”; coordinate axes, elapsed time and absolute value shared “Numbers on a number line”; mental mixed calculations and order of operations were labelled “Ratio”. These names now match their existing descriptions. US coin and imperial-measure examples are labelled explicitly as such; this review does not present them as NZ currency or metric activities.

## Prerequisite corrections

The 42 recorded decisions comprise 8 edge removals, 29 strength changes and 5 additions, applied after identity consolidation. Consolidation also removes self-links and coalesces duplicate endpoint pairs. The one conflicting inherited strength pair (proportion graphs → ratio notation) has an explicit reviewed decision. Unedited collisions preserve the strongest requirement and combine evidence; only hard edges determine readiness and learning paths.

- Symmetry recognition/completion and describing simple movements no longer require the full coordinate transformation bundle. Translation/reflection no longer requires its own later rotation extension.
- Probability-scale interpretation can precede theoretical probability calculation. Percent notation is an optional extension. Relative-frequency estimation no longer requires long-run probability analysis, and empirical estimation is optional for theoretical tree diagrams.
- Ratio notation no longer requires unequal-sharing applications or proportion graphs. Rates can be introduced before inverse proportion.
- Area-model equivalence does not require number-line equivalence. Angle addition and full-turn/straight-line/opposite-angle facts do not create mutual hard gates after merging.
- Scatter-plot construction no longer requires prediction from a fitted line. Univariate statistics are helpful context for prediction rather than compulsory prior calculations.
- Reading a supplied graph does not require calculating gradient, and general graphical intersections do not require constructing both linear and quadratic function families.
- Mean calculation can start with integer totals and exact division. Recovering a whole from a fractional part uses equal-part reasoning, multiplication and division without first requiring the entire later fraction-of-amount method.

The UI now draws required links as solid arrows and helpful links as dashed arrows, places required foundations first, and states both counts. This distinction matters when a broader application remains as useful context.

The fully expanded path to line symmetry drops from 49 nodes to 5, to ratio notation from 35 to 12, and to the mean from 83 to 8. These are structural path sizes when no knowledge is marked; they are not prescribed lesson counts or evidence that every learner needs every step.

Curriculum evidence used for scope includes [Phase 2, Years 4–6](https://newzealandcurriculum.tahurangi.education.govt.nz/5637289332.p) and [Phase 3, Years 7–8](https://newzealandcurriculum.tahurangi.education.govt.nz/5637289333.p), with Phase 4 locators retained in the source registry. All revised dependency judgements are labelled `pedagogical_inference`; curriculum content does not prescribe this exact graph order.

## Current exports and verification

`npm run build` generates `/open-data/current/` from the same runtime as the explorer and MCP: topics, dependencies, curriculum mappings, standards, requirements, sources, curation decisions and a manifest. The older `/open-data/` and `/open-data/nz-maths/` downloads remain clearly documented source archives.

Automated checks cover unique active IDs and endpoint pairs, no self-links or hard cycles, every live reference resolving, retained mappings/diagnostics/hints/applicability, all merge-strength conflicts reviewed, meaningful foundation paths, retired IDs absent from active lookups, title disambiguation, bilingual homepage counts and MCP behaviour. The source validator checks original checksums and all 300 supplied numeric checks. Four added diagnostic answers were separately checked: total probability 0.9 is incomplete, opposite/adjacent angles are 117°/63°, red:blue 2:3 gives 2/3 versus 2/5, and impossible/even/certain map to 0/½/1.

Remaining limitations: this is editorial review, with no independent teacher moderation or classroom trial. The package's documented curriculum and assessment gaps remain. No claim is made that every semantic overlap or pedagogical relationship throughout mathematics has been independently certified. Other subjects are outside this revision.
