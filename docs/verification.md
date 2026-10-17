# Verification — 18 October 2026

Public site: https://edu.w1.nz

## Passed

- Original upstream validation: 1,590 topics, 3,221 dependencies, 3,261 standards and 183 clusters; original checksums intact.
- Combined graph: 1,606 topics, 3,253 edges; no missing IDs or cycles. NZ records retain source links and explicit editorial-draft status. Hard-prerequisite ordering, known-topic skipping and reachable frontier tested.
- Separate frontend and Worker TypeScript checks; production Vite and Worker bundles.
- Local and production HTTP integration: registration/login/logout, HttpOnly cookies, CSRF rejection, two-account isolation, exact OAuth redirects, consent and denial, S256 PKCE, invalid verifier rejection, one-use authorization codes, token rotation/revocation, rate limits and deletion.
- Local D1 checks: deleting an account cascades to its sessions/tokens; expired records are cleaned up.
- Official MCP TypeScript SDK against production: initializes, lists all five tools, calls every tool and receives sources, attribution and teaching guidance.
- Real Claude Code using Opus 5.5 and an isolated HTTP MCP configuration: called `mcp__nz-learning__search_topics` and returned `nz_coins_change: NZ coins and change`. The personal token was subsequently revoked and its temporary account deleted.
- Pinned `mcp-remote@0.15.1` stdio bridge against production: discovered all five tools and executed search. This tests the bridge configuration supplied for WorkBuddy.
- Ego Lite desktop browser: search, NZ-only filtering, no-results state, topic selection, local understood-topic marks and clearing; parent registration, key creation, revocation, logout/login, deletion; connection tabs.

- Mobile browser at 390 × 844: readable layout, responsive navigation and no document-level horizontal overflow.

## Custom domain and parent languages

- Primary website: https://edu.w1.nz; MCP endpoint: https://edu.w1.nz/mcp.
- English / 简体中文 selector is visible in the top-right navigation, including mobile. The choice is saved in this browser.
- Marketing, parent account controls and connection instructions are translated. Learning topics, teaching examples, graph details, AI prompts and configuration code remain English.
- Browser checks cover switching, reload persistence, dynamically rendered connection guides, English restoration, unchanged teaching content/configuration, and mobile overflow.

## Scope and limitations

- ChatGPT and Claude consumer-account OAuth setup screens were not exercised. OAuth was tested at protocol level. Their plans, workspace controls and UI availability vary.
- The WorkBuddy application itself was not run; its documented stdio configuration and the actual bridge were tested separately.
- Codex's own OAuth browser login was not exercised. The service advertises dynamic registration and supports S256 PKCE. Select automatic registration in clients that offer multiple identities.
- NZ additions are editorial drafts, not reviewed by a NZ teacher. The original international topics have not been comprehensively remapped to the NZ curriculum.
- Parent accounts deliberately have no email recovery. No child profiles or server-side learning histories are provided. Local topic marks are per browser, not per child/account.
- OAuth access lasts 24 hours and requires reconnecting; no refresh tokens are issued. Personal keys last 90 days and can be revoked immediately.

All temporary test accounts and credentials are removed after verification. No test password or token is committed.
