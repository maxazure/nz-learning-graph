# Learning Paths NZ

An open, parent-guided learning map for Aotearoa New Zealand. Explore ideas and prerequisites, try a short activity, then connect your own AI assistant through MCP.

**Website:** https://edu.w1.nz

Parent guides and account/connection instructions are available in English and 简体中文 using the top-right language selector. Learning content, examples, AI prompts and configuration commands remain in English.

Forked from [Marble Skill Taxonomy](https://github.com/withmarbleapp/os-taxonomy). The original 1,590 topics and 3,221 dependencies are preserved. A separate NZ layer adds 16 activities and 32 prerequisite links. This is an independent **open beta**, not a complete NZ curriculum mapping, Ministry-endorsed product or teacher-reviewed assessment.

## For parents

1. Browse the map without an account. Search by topic or subject; the year filter applies only to the NZ additions.
2. Read the observable evidence and try one question. Mark understood topics locally to shorten the suggested foundation-first pathway. Marks stay in your browser and can be cleared.
3. Create a parent username and password to connect an AI tool. Save your credentials: no email address is collected and email recovery is not provided.
4. Follow the in-site guide for ChatGPT, Claude, Codex, Claude Code or WorkBuddy. OAuth clients use sign-in; header-based clients use a personal connection key. WorkBuddy uses the documented stdio configuration with a pinned `mcp-remote` bridge.
5. Ask your AI to look up a topic, check the prerequisites and suggest a ten-minute activity. Review its answers together. Do not send child-identifying information.

The service supplies educational context; parents use their own AI subscriptions. Client availability and workspace permissions depend on the provider. Actual client account tests and protocol tests are distinguished in [verification](docs/verification.md).

## Run locally

Node.js 22+ and npm:

```sh
npm ci
npx wrangler d1 migrations apply nz-learning-graph --local
npm run dev
```

`npm run dev` builds the browser app and Pages advanced-mode Worker, then runs Pages locally. The persistent database is local by default.

```sh
npm run validate
npm run typecheck
npm test
TEST_BASE_URL=http://localhost:8788 npx tsx --test tests/backend.test.ts
```

The HTTP integration test requires a running development service. The opt-in storage test is local-only; see its source before running. It inspects deletion cascades and expired-row cleanup. Upstream validation verifies the original manifest and checksums; graph tests additionally validate the NZ graph.

## Architecture

- Vite + TypeScript, no frontend framework; visual design commissioned from **Claude Code Opus 5.5** in `design/prototype.html`.
- `lib/graph.ts`: search, direct prerequisites, hard-prerequisite ordering and reachable next topics.
- `data/nz-overlay.json`: source-linked NZ additions, suggested years, activities and explicit review flags.
- `server/`: Cloudflare Pages advanced-mode Worker, D1 accounts, OAuth PKCE and official MCP SDK Streamable HTTP transport.
- `migrations/`: D1 schema. Browser sessions, bearer credentials and authorization codes are hashed; passwords use salted PBKDF2. OAuth codes are short-lived and single-use. Requests are bounded and rate-limited.
- `web/`: responsive parent guide, knowledge map, accounts, connection instructions and privacy notice.

The account stores no child profiles. Topic marks stay in localStorage. MCP inputs are processed per request, not persisted. Technical hosting logs may contain request metadata; do not send private information. Personal keys expire in 90 days; OAuth access in 24 hours, followed by reauthorization. Revoke all connections or delete the account from the website.

## MCP

Endpoint: `https://edu.w1.nz/mcp`.

Five read-only tools:

- `search_topics`
- `get_topic`
- `get_prerequisites`
- `create_learning_path`
- `suggest_next_topics`

Results carry provenance, attribution and educational limitations. OAuth discovery, dynamic public-client registration, S256 PKCE and exact redirect matching are supported. Select **Register automatically** where a client offers that option. MCP credentials cannot change accounts or store children’s records.

## Deploy

A Cloudflare account with Pages and D1 write access is needed. Set your own database ID in `wrangler.jsonc` for another deployment.

```sh
npx wrangler d1 migrations apply nz-learning-graph --remote
npm run deploy
```

The daily expired-record cleanup runs once on an authentication request, with a D1 lock, so Pages does not need a cron. Local and production D1 data are separate. Do not commit `.dev.vars`, credentials or runtime state.

## Data provenance and licences

Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · database under [ODbL 1.0](LICENSE), Marble-authored content under [CC BY-SA 4.0](LICENSE-CONTENT).

The NZ derivative database is ODbL 1.0 and adapted/new educational text is CC BY-SA 4.0. Original framework material retains its upstream terms in [PROVENANCE.md](PROVENANCE.md). No third-party curriculum text has been newly copied into the NZ layer; the layer contains editorial summaries and source links. [NZ sources and scope](docs/nz-curriculum.md) distinguishes official source status from our unreviewed mapping status.

Download open data from the repository or `/open-data/topics.json`, `/open-data/dependencies.json`, `/open-data/nz-overlay.json` on the website. Application source in `web/`, `server/`, `lib/`, `scripts/build-pages.mjs` and tests is MIT-licensed; see [LICENSE-CODE](LICENSE-CODE). Original upstream files retain their original licences.

Teachers and caregivers can [report a problem or propose a review](https://github.com/maxazure/nz-learning-graph/issues). Never post child-identifying information in public issues.
