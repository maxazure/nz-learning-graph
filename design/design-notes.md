# Learning Paths NZ: design notes

Prototype: `design/prototype.html` (single file, inline CSS and JS, no external assets, works offline).

## Intent

A calm, editorial tool for parents, not an ed-tech dashboard. The page should answer one question first, "what is my child ready to learn next?", and only later reveal accounts and AI connections for people who want them.

## Visual system

| Token | Value | Use |
|---|---|---|
| Cream | `#F5EFE3` | Page background, warm and paper-like |
| Paper | `#FBF8F1` | Cards and alternating sections |
| Forest | `#1E3B2B` | Headings, primary buttons, "Got it" nodes, footer |
| Moss | `#DCE5D6` / `#EEF2EA` | "Practising" state, soft panels |
| Orange | `#D8662A` | Accent only: "Ready next", eyebrow rules, focus ring |
| Orange ink | `#A9431A` | Orange when used as text (passes AA on cream) |

- Orange is never used as a button fill with white text (it fails contrast). Primary actions are forest green. Orange marks the one thing that matters on each screen: the next step.
- Type: a Palatino/Iowan serif stack for headings and pull quotes (bookish, trustworthy, no web font download), system sans for UI and body. Italic serif in orange is the signature flourish in headings.
- Spacing: fluid `clamp()` section padding (72 to 128px), 1180px max width, 22px card radius. Generous white space carries the "restrained" brief.
- No photos. The only illustrations are the logo mark (a tiny prerequisite graph) and a pavlova cut into sixths.

## Page structure and why

1. **Draft notice bar**: the honesty statement is the first thing on the page, not buried in a footer.
2. **Header**: plain-language nav ("The map", "Use with your AI"). Collapses to a menu button under 980px.
3. **Hero**: headline in parent words. Search asks "What is your child working on?" with an age picker and common worries as chips (fractions, telling the time). The right-hand card shows one child's path as a vertical timeline: Got it, Practising, Ready next, Later on, plus a ten-minute idea for tonight. No mention of graphs, MCP or data in the hero.
4. **The map**: an SVG prerequisite graph for fractions, arranged in age columns 5 to 10. Four states (filled, tinted, orange outline, dashed) and two edge types (needed first, helps). Clicking or pressing Enter on a node dims everything except its ancestors (green) and descendants (orange), and updates the side panel with "Builds on" (with the reason for each link) and "Opens up". A Map/List toggle provides a linear, screen-reader and small-screen friendly view. On mobile the map scrolls sideways with a hint.
5. **Getting started**: three numbered cards, Explore (no sign-up), Parent account (featured in forest), Connect your own AI (optional). The order tells parents they can stop at step one.
6. **Subject explorer**: subject tabs with real step counts from `data/topics.json` (Science 547, Mathematics 503, English 286 ...). An age slider filters sample steps to within two years and shows the approximate NZ Year level. Each domain card has an age-span bar.
7. **Topic detail** ("Fractions of a whole", using the real evidence statements and check-in question from the dataset): plain-language summary, tickable "How you will know they have got it" list, a casual question to ask, and an NZ home example (cutting the pav for the whānau). The sidebar shows prerequisites, what it unlocks, and a provenance card with four explicit rows: source-based (yes), NZ alignment (draft), Ministry endorsed (no), teacher reviewed (no).
8. **Account and AI**: left, a sample whānau account with two children, progress bars and a plain privacy list. Right, a dark forest panel with accessible tabs (arrow keys, Home/End) for ChatGPT, Claude, Codex, Claude Code and WorkBuddy. Each tab says who it suits, gives numbered steps, a copyable snippet and an example question to ask. "MCP server" appears once, in brackets, as the technical name.
9. **About the NZ version**: a large statement plus four facts (where it comes from, what changed, what it is not, who checks it) and an invitation for teachers and kaiako to review.
10. **Footer** repeats the draft disclaimer.

## Language

- NZ English throughout: practise (verb), maths, whānau, tamariki, kaiako, Year 4, pav, feijoas.
- Ages are shown with approximate Year levels (age minus 4) because NZ parents think in Years.
- Te reo Māori fraction words are labelled as needing review by a fluent speaker, in keeping with the draft framing.

## Accessibility

- Skip link, landmark roles, `aria-live` on the map inspector and subject panel.
- Graph nodes are focusable buttons with full labels (name, age, status); a list view is provided as an alternative.
- Visible 3px orange focus ring; status is never shown by colour alone (each node prints its status text).
- Touch targets are 44px or larger; inputs are 17 to 18px to avoid iOS zoom.
- `prefers-reduced-motion` disables smooth scroll and transitions.

## Placeholders to confirm before build

- The connector address `https://mcp.learningpaths.nz` and the menu paths in each AI tab are illustrative. Check against each app's current help docs (WorkBuddy especially).
- The child names, progress numbers and most explorer sample step names are mock data. Subject counts, the fractions evidence and the check-in question come from the dataset.
- The NZ Curriculum alignment ("Years 4–6") is a draft and should be checked by a maths educator.
