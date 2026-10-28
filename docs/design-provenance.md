# Design provenance

The visual design was commissioned through the local Claude Code CLI using the exact model `claude-opus-5-5`, at Jay's request on 18 October 2026. The successful design run reported that same model and generated `design/prototype.html` and `design/design-notes.md`.

The earlier Sonnet request was stopped before implementation; its design was not used. The Opus prototype was rendered and visually inspected in Ego Lite before the production frontend was implemented.

The production frontend retains the prototype's cream/forest/orange palette, serif headings, layout rhythm, brand mark, parent-oriented hero and three-step guide. Prototype-only claims, child profiles, placeholder connection URLs, age-to-year conversions and sample data were replaced with the implemented account model, live graph data and verified documentation. The hero learning sequence is explicitly labelled illustrative.

The original HTML is a design reference, not the deployed application. The application is built from `web/`.

On 29 October 2026, at Jay's request, `claude-opus-5-5` was used through the local Claude Code CLI to implement the interactive constellation explorer in `web/constellation.ts`, `web/explorer.ts` and related styles. The session reached its usage limit before a final handoff; subsequent integration, navigation fixes, source and licence review, and browser verification were completed in the main workspace. The stars, subject clusters, connections and counts are computed from the live graph rather than fabricated example data. The overview samples topic stars for readability; the topic list and detail disclose all recorded connections.
