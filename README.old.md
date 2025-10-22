# jsfaq — Jahia FAQ Module

SEO-ready FAQ experience for Jahia. `jsfaq` renders semantic FAQ content server-side for instant readability, enriches pages with schema.org JSON-LD, and hydrates lightweight islands to power search, tag filtering, featured ordering, and collapsible questions without a Java backend.

## Key Features
- Server-rendered FAQPage markup with schema.org compliant JSON-LD (Question/Answer) emitted once per page.
- Search box with full-text matching on questions and answers, tag filters, featured-first ordering, and “copy link” shortcuts.
- Keyboard-accessible collapsible questions that preserve state via URL hashes (`#q-<uuid>`).
- Multilingual authoring with localized strings (EN/FR bundled) and JSON-driven hydrations.
- Lightweight <25 KB client island that lazy-loads on visibility and respects `prefers-reduced-motion`.

## Installation & Build
```bash
yarn install        # install dependencies
yarn build          # emit dist/server and dist/client bundles
yarn package        # produce dist/package.tgz ready for Jahia upload
```

## Authoring Workflow
1. In Jahia, create a `jsfaqnt:faqPage`, provide the localized title and optional intro rich text.
2. Add `jsfaqnt:faqSection` nodes for logical groups (title + description), then drop `jsfaqnt:faqItem` entries inside each section.
3. Use standalone `jsfaqnt:faqItem` children on the page for uncategorised questions.
4. Populate question, answer (rich text), optional tags, `isFeatured`, and `order`. Publish when ready—SSR ensures LIVE pages work with JS disabled.

## Architecture Overview

| Concern              | Location / Notes                                   |
| -------------------- | -------------------------------------------------- |
| Content Model        | `settings/definitions.cnd` + `src/components/Faq*/definition.cnd` |
| Server Rendering     | `src/components/FaqPage/default.server.tsx`, `src/components/FaqSection/default.server.tsx`, `src/components/FaqItem/default.server.tsx` (shared utilities in `src/components/FaqPage/serverUtils.tsx`) |
| Client Islands       | `src/components/FaqPage/FaqPage.client.tsx` with presentational parts in `src/components/FaqPage/`, `src/components/FaqSection/`, `src/components/FaqItem/` |
| GraphQL Helpers      | `src/graphql/faq.ts`                               |
| JSON-LD Builder      | `src/server/schemaOrg.ts` + HTML sanitizer in `src/server/sanitize.ts` |
| Styling              | `src/styles/index.css` with CSS variables & focus states |
| Locales              | `locales/en.json`, `locales/fr.json`               |

## Customization
- Theme via CSS custom properties (see `:root` tokens in `src/styles/index.css`).
- Toggle features by adjusting island behaviour in `src/components/FaqPage/FaqPage.client.tsx` (e.g., disable featured-first or hash syncing).
- Extend GraphQL query fields in `src/graphql/faq.ts` when adding new properties to `jsfaqnt:*` types.

## Accessibility & i18n
- Disclosure buttons carry `aria-expanded`/`aria-controls`; answers are mapped to accessible regions.
- Focus rings remain visible; motion reduces automatically under `prefers-reduced-motion`.
- Localized UI strings resolve through the `data-faq-props` payload, defaulting to English when a language file is missing.

## Validation
- Confirm build integrity: `yarn build`.
- Upload `dist/package.tgz` to Jahia Modules. Content renders fully without client JavaScript.
- Validate the generated JSON-LD block using Google’s [Rich Results Test](https://search.google.com/test/rich-results).
