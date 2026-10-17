# Learning Paths NZ implementation plan

18 October 2026. Fork of withmarbleapp/os-taxonomy. Public parent-directed, English-medium NZ learning support with an open derivative database.

1. Preserve upstream dataset, licences and provenance; add separately sourced NZ activities with actual prerequisite references, explicit editorial review status and suggested year bands. No claims of complete NZ curriculum alignment.
2. Commission Claude Code Opus 5.5 for an HTML visual prototype before implementing the site. Translate its visual direction into responsive accessible pages.
3. Build browse/search, direct prerequisite neighbourhood, evidence checks, and hard-prerequisite learning paths. Keep parent-selected known topics in their browser only.
4. Provide parent username/password accounts, hashed passwords and tokens, secure sessions, revocable read-only MCP access, OAuth PKCE consent and connection guidance.
5. Publish on Cloudflare Workers with D1. Keep source and derivative data publicly available on GitHub. No AI API key required: parent supplies their own compatible AI tool.
6. Validate upstream data; test graph ordering, authentication, isolation, revoked credentials and OAuth. Exercise complete parent flow in a real browser at desktop and mobile widths. Document external-client verification limitations.

Acceptance: public website loads, useful graph and NZ contexts are discoverable, parent can register/sign in/manage credentials, authenticated official MCP client can discover/call tools, unauthenticated/revoked access is denied, OAuth authorization code is single-use with PKCE, account deletion removes access, browser has no broken main interactions or horizontal overflow.
