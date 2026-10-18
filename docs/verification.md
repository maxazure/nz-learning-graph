# Verification — 18 October 2026

Website: https://edu.w1.nz · Public MCP: https://edu.w1.nz/mcp

## Public MCP release

The app now uses anonymous, read-only MCP. Accounts, personal keys, OAuth and runtime database bindings have been removed. The earlier authenticated implementation is retained only in Git history; the old D1 database has not been deleted or altered.

Passed before deployment:

- Original upstream data checksums and reference validation: 1,590 topics, 3,221 dependencies, 3,261 standards, 183 clusters.
- TypeScript checks for browser and Worker, production build, eight graph and public-protocol tests.
- Local Pages runtime: anonymous initialize, discovery, every tool, cross-origin POST/preflight, request/input size limits, and retired auth/OAuth routes returning 404 without an authentication challenge.
- Official MCP SDK calls all five tools without credentials against the local Pages runtime.
- Ego Lite: all five client tabs, Chinese and English setup prompts, endpoint and search verification in each prompt, real Copy button success, no account fields or draft/Ministry notices, mobile at 390 × 844 without document overflow.
- The `telling the time` search remains covered by backend tests and yields matching original topics.

## Client instructions and limits

Setup instructions checked against official documentation:

- [ChatGPT Work MCP](https://learn.chatgpt.com/docs/extend/mcp): desktop uses local Codex-compatible configuration; web Work uses plugins. Desktop settings do not install a web plugin.
- [Claude Code MCP](https://code.claude.com/docs/en/mcp): HTTP server installation with user scope.
- [Codex MCP](https://developers.openai.com/codex/mcp): public remote URL, no login command required.
- [WorkBuddy MCP](https://www.workbuddy.ai/docs/zh/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/MCP-Guide): local mcp.json config. The supplied setup prompt uses pinned mcp-remote@0.15.1 as a stdio-to-HTTP bridge.
- [Claude custom connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp): add a connector once with No sign in and enable it for the conversation.

Prompts preserve other MCP settings, request a real search to confirm success and explain when a restart is needed. A prompt cannot grant filesystem or app permissions its host does not already have. Consumer-account app installation flows have not all been exercised; protocol verification does not establish that every provider's UI or subscription enables the feature.

Curriculum provenance metadata and source links remain in the dataset. Parent-facing approval and draft notices were removed. Teaching material remains English; setup prompts and parent explanations follow the website language.

## Production verification

Deployed public release `7fc9d57` to edu.w1.nz (Pages deployment `fb5909d6`).

- All four public HTTP integration tests passed on https://edu.w1.nz, including cross-origin access and absent account/OAuth flows.
- Anonymous official MCP SDK initialized, discovered and called all five tools.
- Claude Code Opus 5.5, with an isolated HTTP MCP configuration containing only the URL and no credentials, made a real `search_topics` call and returned six results; example `mt_HNOPGJYiRK` / Telling Time: Minutes.
- The exact pinned WorkBuddy bridge configuration discovered five tools and searched `telling the time`, returning six topics without credentials. The WorkBuddy application itself was not run.
- Production browser verified Chinese copy controls, absence of account fields and removed notices, and six results for the reported search. System clipboard contents matched the displayed public Claude Code setup command and tool-verification prompt.
- Automatic installation by ChatGPT Work, Codex and WorkBuddy conversational agents and Claude's consumer connector UI were not exercised end-to-end. Their prompts reflect official documented configuration routes and explicitly ask the host to report missing permissions/restarts.
