# Learning Paths NZ

A public learning graph for AI tools supporting New Zealand families.

**Website:** https://edu.w1.nz · **Public MCP:** https://edu.w1.nz/mcp

The site provides English and Chinese setup prompts for ChatGPT Work desktop, Claude Code, WorkBuddy, Codex and Claude. Parents copy a prompt into their AI tool; the prompt helps configure the connection and verifies it with a real topic search. Some clients need a restart or a one-time connector setting. No website account, login, token or API key is required.

Teaching topics, examples and graph data remain English. Parent-facing guides and setup prompts follow the selected website language.

## Use

1. Open the website and choose your AI tool.
2. Copy its setup prompt into a new conversation. Allow any configuration action requested by your own AI app, and restart if needed.
3. Ask about a topic. The AI can search, check prerequisites and plan a short activity.

The website also lets you browse the graph. Year filters include maths mappings and the 16 NZ activities through Year 13. Search bands are editorial guidance; individual mappings preserve exact scope and school year is separate from qualification level. Topic marks stay in the browser.

ChatGPT Work desktop shares MCP configuration with Codex. Web Work uses plugins. Claude web/desktop requires adding the connector once; a chat prompt cannot silently change those account settings. Sources and actual verification coverage are in [verification](docs/verification.md).

## Development

Node.js 22+ and npm:

```sh
npm ci
npm run dev
```

The app uses Vite and a Cloudflare Pages advanced-mode Worker. No database is required.

```sh
npm run validate
python3 data/nz-maths/validate.py --output /tmp/nz-maths-validation.json
npm run typecheck
npm test
TEST_BASE_URL=http://localhost:8788 npx tsx --test tests/backend.test.ts
TEST_BASE_URL=http://localhost:8788 node scripts/smoke-mcp.mjs
```

Use the actual local port printed by Wrangler. Backend tests run in-process by default; TEST_BASE_URL runs them against a deployed service. The SDK smoke verifies all six tools without credentials.

## Architecture

- `web/`: bilingual parent guide, copyable setup prompts and optional graph explorer. Visual design originated with Claude Code Opus 5.5 in `design/prototype.html`.
- `lib/graph.ts`: search, prerequisite traversal, learning paths and reachable next topics.
- `data/nz-maths/`: all 22 original research files, diagnostic pedagogy, independent mappings, standards, sources, coverage gaps and validator. See [import decisions](docs/maths-integration.md).
- `data/nz-overlay.json`: source-linked NZ activities, suggested years and provenance metadata.
- `server/`: public read-only MCP using the official SDK's stateless Streamable HTTP transport. Cross-origin requests and preflight are supported. Request sizes and tool inputs are bounded.
- No account, OAuth, session, token or database code is used by the application. The previous D1 database is detached and left unchanged.

The six MCP tools are `search_topics`, `get_topic`, `get_curriculum_context`, `get_prerequisites`, `create_learning_path` and `suggest_next_topics`. Responses include source links and licence attribution. Inputs are processed per request, not stored. Hosting providers may process technical request logs; the parent's AI service handles conversations under its own terms.

## Deploy

```sh
npm run deploy
```

Cloudflare Pages project: `nz-learning-graph`. Custom domain: `edu.w1.nz`. No D1 provisioning or authentication secrets are needed.

## Open data and licences

Forked from [Marble Skill Taxonomy](https://github.com/withmarbleapp/os-taxonomy). The original 1,590 topics and 3,221 dependencies are preserved as source archives; 16 NZ activities add 32 connections, forming the original 1,606-topic baseline. The 2026-10-18 maths supplement adds 264 topics and enriches 152 existing topics. Subsequent [maths curation](docs/maths-curation.md) consolidates 11 duplicate records, clarifies misleading headings and revises 42 prerequisite pairs. The active website and MCP use 1,859 topics and 3,981 distinct edges, with 458 diagnostics and all 1,287 scoped mappings.

Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com. Database and derivative under [ODbL 1.0](LICENSE); Marble-authored and adapted content under [CC BY-SA 4.0](LICENSE-CONTENT). Third-party material retains its upstream terms in [PROVENANCE.md](PROVENANCE.md). App code is [MIT](LICENSE-CODE).

Supplement files: `/open-data/nz-maths/README.md` and the other files in that directory.

Current downloads: `/open-data/current/manifest.json`, `topics.json`, `dependencies.json`, `curriculum-mappings.json`, `standards.json`, `curriculum-requirements.json`, `sources.json` and `maths-curation.json` in the same directory. These are exported from the same runtime used by the website and MCP. Retired duplicate IDs are source provenance only, not public aliases.

Original downloads: `/open-data/topics.json`, `/open-data/dependencies.json`, `/open-data/nz-overlay.json`. Sources are documented in [NZ curriculum context](docs/nz-curriculum.md). [Suggest a correction](https://github.com/maxazure/nz-learning-graph/issues).
