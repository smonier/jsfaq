# jsfaq

[![CI](https://github.com/smonier/jsfaq/actions/workflows/ci.yml/badge.svg)](https://github.com/smonier/jsfaq/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/smonier/jsfaq)](https://github.com/smonier/jsfaq/releases)

An accessible FAQ component for Jahia 8.2, built as a Jahia JavaScript module. Editors compose a
FAQ from optional sections and question-and-answer items; the module renders it on the server as
native disclosures that work without JavaScript, adds search, tag filtering and expand/collapse
controls when scripts run, and publishes the questions as schema.org `FAQPage` structured data.

## Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage for editors](#usage-for-editors)
- [Content model](#content-model)
- [Accessibility](#accessibility)
- [Structured data](#structured-data)
- [Theming](#theming)
- [Internationalisation](#internationalisation)
- [Development](#development)
- [Changelog](#changelog)
- [License](#license)

## Features

- **Server-side rendering.** The whole FAQ is rendered by the server; every question is a native
  `<details>` / `<summary>` disclosure.
- **Sections.** Questions can be grouped under titled sections, or placed directly in the FAQ.
- **Configurable heading level.** The FAQ title is rendered as `h2`, `h3` or `h4`; sections,
  questions and the headings inside formatted text follow without skipping a level.
- **Search.** Filters questions on the text of the question and the answer, ignoring case and
  accents, opens the matching questions and highlights the matches.
- **Tag filter (optional).** Toggle buttons built from the Jahia tags of the questions; a question
  is shown when it carries every selected tag.
- **Expand all / Collapse all.**
- **Links to a question.** `#q-<id>` opens the question and moves the focus to it.
- **Featured questions.** A "Featured" badge next to the question.
- **Formatted text rendered through an allow-list,** whatever the site's own HTML filtering
  settings are.
- **schema.org `FAQPage` JSON-LD** that matches the visible questions.
- **Theming through CSS custom properties.**
- **Translations** in English, French, German and Spanish.

## Requirements

| Requirement                 | Version                                      |
| --------------------------- | -------------------------------------------- |
| Jahia                       | 8.2.1.0 or later                             |
| `javascript-modules-engine` | 1.x (`[1,2)`)                                |
| Node.js (to build only)     | 22 or later                                  |
| Yarn (to build only)        | 4 (`yarn@4.10.3`, provided through Corepack) |

The module depends on the `default` Jahia module and on `javascript-modules-engine`. It has no
dependency on jExperience.

## Installation

### From a release

1. Download `jsfaq-v<version>.tgz` from the
   [GitHub Releases](https://github.com/smonier/jsfaq/releases) page.
2. In Jahia, open **Administration**, go to **Modules**, and upload the file. Install
   `javascript-modules-engine` 1.x first if your Jahia does not already provide it.
3. Enable `jsfaq` on the sites that use it.

### From source

```bash
corepack enable
yarn install
yarn build
yarn package   # writes dist/package.tgz
```

Install `dist/package.tgz` the same way, or deploy it to a running Jahia with `yarn deploy` (see
[Deploy to a local Jahia](#deploy-to-a-local-jahia)).

## Usage for editors

The module adds three content types to the **FAQ Components** group of the content picker.

1. Add a **FAQ Page** to an area of a page. Despite its name it is a component, not a page: it
   holds the whole FAQ.
2. Fill in the FAQ Page fields:
   - **Title** (`jcr:title`): the heading of the FAQ. When it is empty, no heading is rendered.
   - **Introduction**: optional formatted text shown under the title.
   - **Title heading level**: `h2` (default) when the FAQ follows the page title directly, `h3`
     under a section heading of the page, `h4` one level deeper. The page template renders the
     page's only `<h1>`; the FAQ never does.
   - **Enable tag filtering**: shows the tag filter buttons above the questions (off by default).
3. Inside the FAQ Page, add **FAQ Section** items to group questions, **FAQ Item** entries
   directly, or both. Sections and questions are ordered as in the content tree.
4. For each **FAQ Section**, enter a **Section Title** and an optional **Section Description**,
   then add FAQ Items inside it.
5. For each **FAQ Item**, enter the **Question** and the **Answer** (formatted text), tick
   **Featured** to show the "Featured" badge, and add tags with the standard Jahia tag field.
6. Publish the FAQ Page.

Notes:

- The tag filter lists every tag used by the questions of the FAQ, sorted alphabetically. It is
  not shown when no question has a tag. Tags are always listed under the answer they belong to.
- In edit mode every answer is shown open and the search and filter controls are not rendered,
  so that every answer can be reached and edited.
- When an image in formatted text has no text alternative, edit mode shows a message under the
  text asking the editor to describe the image or mark it decorative.
- A FAQ Section or FAQ Item dropped outside a FAQ Page renders on its own with an `h3` heading,
  without the search, the filters or structured data.

## Content model

Namespace prefixes: `jsfaqnt` (types) and `jsfaqmix` (mixins). The type definitions are in
`settings/definitions.cnd` and `src/components/*/definition.cnd`.

| Type                 | Supertypes                                                                               | Children                |
| -------------------- | ---------------------------------------------------------------------------------------- | ----------------------- |
| `jsfaqmix:component` | `jmix:droppableContent`, `jmix:accessControllableContent` (mixin)                        |                         |
| `jsfaqnt:faqPage`    | `jnt:content`, `mix:title`, `jmix:list`, `jmix:structuredContent`, `jsfaqmix:component`  | `faqSection`, `faqItem` |
| `jsfaqnt:faqSection` | `jnt:content`, `mix:title`, `jmix:list`, `jmix:structuredContent`, `jsfaqmix:component`  | `faqItem`               |
| `jsfaqnt:faqItem`    | `jnt:content`, `mix:title`, `jmix:editorialContent`, `jsfaqmix:component`, `jmix:tagged` |                         |

All three types are orderable.

### `jsfaqnt:faqPage`

| Property          | Type                      | Translated | Default | Purpose                                                  |
| ----------------- | ------------------------- | ---------- | ------- | -------------------------------------------------------- |
| `jcr:title`       | string (from `mix:title`) | yes        |         | FAQ heading; no heading when empty                       |
| `intro`           | rich text                 | yes        |         | Introduction under the title                             |
| `headingLevel`    | choice: `2`, `3`, `4`     | no         | `2`     | Level of the FAQ title; sections and questions follow it |
| `enableTagFilter` | boolean                   | no         | `false` | Shows the tag filter buttons                             |

### `jsfaqnt:faqSection`

| Property             | Type      | Translated | Required | Purpose                                                |
| -------------------- | --------- | ---------- | -------- | ------------------------------------------------------ |
| `sectionTitle`       | string    | yes        | yes      | Section heading (falls back to `jcr:title` when empty) |
| `sectionDescription` | rich text | yes        | no       | Text under the section heading                         |

### `jsfaqnt:faqItem`

| Property     | Type                      | Translated | Required | Purpose                                                 |
| ------------ | ------------------------- | ---------- | -------- | ------------------------------------------------------- |
| `question`   | string                    | yes        | yes      | Question heading (falls back to `jcr:title` when empty) |
| `answer`     | rich text                 | yes        | yes      | Answer                                                  |
| `isFeatured` | boolean                   | no         | no       | Shows the "Featured" badge; default `false`             |
| `j:tagList`  | tags (from `jmix:tagged`) | no         | no       | Tags used by the tag filter and listed under the answer |

## Accessibility

The module targets RGAA 4.1.2 and WCAG 2.1 level AA.

### Structure and headings

- The FAQ never renders an `<h1>`. The FAQ title uses the level chosen by the editor; sections
  take the next level, questions the level under their section (or under the FAQ title), and
  headings written inside formatted text are renumbered to start one level under the heading that
  introduces them. Levels never skip and stop at `h6`.
- The tag buttons are a labelled group; the tags of a question are a labelled list.

### Keyboard and screen readers

- Each question is a `<summary>` holding the question heading. `Enter` and `Space` open and close
  it, and the browser exposes its expanded state.
- The search field has a visible label.
- A status message (`role="status"`) gives the number of matching questions, or says that none
  matches. While the visitor types, it is updated once typing pauses rather than on every key.
- Tag buttons expose their state with `aria-pressed` and show a tick when pressed, so the state
  does not rely on colour alone.
- A link to a question (`#q-<id>`) opens it, scrolls to it and moves the focus to it. If the
  search or a tag had hidden it, the filters are cleared first. Opening a question puts its link
  in the address bar.
- A FAQ placed twice on the same page gets unique ids for its second copy, with its labels, ARIA
  references and anchors updated to match.

### Without JavaScript

- Questions still open and close, as native disclosures.
- The search, tag filter and expand/collapse controls are hidden by the style sheet
  (`@media (scripting: none)`), since they need the script. When scripts run, the controls are
  present from the first paint, so the questions do not move when the script starts.

### Visual

- The default colour pairs meet 4.5:1 for text and 3:1 for focus rings and control borders.
- Every control has a visible focus indicator, which also shows in forced-colors mode.
- Transitions are disabled under `prefers-reduced-motion: reduce`, and scrolling to a linked
  question is instant.
- The layout reflows at 320 px wide and tolerates increased text spacing.

### Formatted text

The introduction, section descriptions and answers are rendered through an allow-list
(`src/server/sanitize.ts`), applied at render time:

- Editorial markup is kept: paragraphs, lists (including definition lists), emphasis, headings,
  links, images, figures, data tables with their captions and header associations, quotes and
  code, plus the `lang`, `dir` and `id` attributes of any element.
- Inline styles and classes are dropped, so the module and the site theme own the look. Links open
  in the same window; links and images carry no `title`.
- Link and image URLs are limited to `http(s)`, `mailto`, `tel`, relative paths, anchors and the
  Jahia link placeholders.
- Ids written by editors are prefixed per text block, together with the anchors and table
  `headers` that point at them, so they stay unique on the page. Anchors to other targets of the
  page, such as another question (`#q-<id>`), are kept as written.
- An image without a text alternative gets an empty one (`alt=""`), and edit mode tells the
  editor.

## Structured data

Each FAQ Page renders one `<script type="application/ld+json">` element with a schema.org
`FAQPage`:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I reset my password?",
      "acceptedAnswer": { "@type": "Answer", "text": "Open the sign-in page and ..." }
    }
  ]
}
```

- It lists the questions of the FAQ in display order, direct items and section items, each once.
- The answer is converted to plain text.
- A question with an empty question or answer is left out, and no script is rendered when no
  question remains.
- The JSON is written with `<`, `>` and `&` as JSON escapes, so it cannot end the script element.

The rendered FAQ depends on all the content under it, so changing, adding or removing a question
refreshes the tag filter and the structured data.

## Theming

The module ships one style sheet (`dist/assets/style.css`, from `src/styles/faq.module.css`),
added to the page by the FAQ Page view. Class names are CSS Modules hashes and are not a stable
API: theme the FAQ through the custom properties below.

### Custom properties

Defaults are declared on `:root`:

| Property                 | Default                                                                                  | Used for                                       |
| ------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `--jsfaq-font-family`    | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif` | Font of the whole FAQ                          |
| `--jsfaq-text-color`     | `#0f172a`                                                                                | Titles, questions, labels                      |
| `--jsfaq-text-secondary` | `#475569`                                                                                | Introduction, descriptions, answers, status    |
| `--jsfaq-muted-color`    | `#64748b`                                                                                | Search icon; control borders by default        |
| `--jsfaq-accent-color`   | `#1d4ed8`                                                                                | Links, chevron, open question border, tag text |
| `--jsfaq-accent-hover`   | `#1e40af`                                                                                | Link hover in answers                          |
| `--jsfaq-accent-light`   | `#dbeafe`                                                                                | Background of the tags under an answer         |
| `--jsfaq-border-color`   | `#e2e8f0`                                                                                | Question borders, header rule                  |
| `--jsfaq-radius`         | `12px`                                                                                   | Corners of questions and the search field      |
| `--jsfaq-spacing`        | `1.5rem`                                                                                 | Gap between sections and direct questions      |
| `--jsfaq-transition`     | `200ms cubic-bezier(0.4, 0, 0.2, 1)`                                                     | Transitions                                    |
| `--jsfaq-featured-bg`    | `#fef3c7`                                                                                | "Featured" badge and edit-mode hint background |
| `--jsfaq-featured-color` | `#92400e`                                                                                | "Featured" badge and edit-mode hint text       |
| `--jsfaq-focus-ring`     | `0 0 0 3px #1d4ed8`                                                                      | Focus ring (a `box-shadow` value)              |
| `--jsfaq-tag-bg`         | `#ffffff`                                                                                | Tag button background                          |
| `--jsfaq-tag-active-bg`  | `#1e3a8a`                                                                                | Pressed tag button background (white text)     |

`--jsfaq-shadow` and `--jsfaq-shadow-lg` are also declared but not used by the current styles.

These properties have no `:root` value; the style sheet reads them with a fallback, so a host can
set them or leave them out:

| Property                  | Fallback                   | Used for                                     |
| ------------------------- | -------------------------- | -------------------------------------------- |
| `--jsfaq-surface`         | `#ffffff`                  | Background of the FAQ                        |
| `--jsfaq-surface-raised`  | `#ffffff`                  | Background of questions and the search field |
| `--jsfaq-control-border`  | `var(--jsfaq-muted-color)` | Borders of the search field and buttons      |
| `--jsfaq-highlight-bg`    | `#fef08a`                  | Background of search matches                 |
| `--jsfaq-highlight-color` | `#0f172a`                  | Text of search matches                       |

### Mapping from a template set

Set the properties on an element that contains the FAQ, such as `body` or a site wrapper: the FAQ
inherits them from that element instead of the `:root` defaults, whatever the order of the style
sheets. A template set with its own design tokens maps them once:

```css
.site {
  --jsfaq-font-family: var(--site-font-body);
  --jsfaq-text-color: var(--site-color-text);
  --jsfaq-text-secondary: var(--site-color-text-muted);
  --jsfaq-accent-color: var(--site-color-primary);
  --jsfaq-border-color: var(--site-color-border);
  --jsfaq-surface: var(--site-color-background);
  --jsfaq-surface-raised: var(--site-color-surface);
  --jsfaq-focus-ring: 0 0 0 3px var(--site-color-focus);
}
```

### Light and dark schemes

The module ships one light scheme and no `prefers-color-scheme` rules of its own. A host with a
dark scheme redefines the properties under its own dark selector or media query. Keep the
contrast ratios when doing so: text pairs at 4.5:1, focus ring and control borders at 3:1, and
`--jsfaq-tag-active-bg` dark enough for the white text of a pressed tag. Search matches use a fixed
light pair by default, readable in both schemes.

## Internationalisation

Two kinds of strings are shipped, in English, French, German and Spanish:

| Strings                                                          | Location                                                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Editor labels and tooltips (content types)                       | `settings/resources/jsfaq.properties` (English), `jsfaq_fr`, `jsfaq_de`, `jsfaq_es` |
| Visitor-facing strings (search, filters, status messages, badge) | `settings/locales/en.json`, `fr.json`, `de.json`, `es.json`                         |

Content is translated per field: the title, introduction, section title and description,
question and answer are translatable; the heading level, tag filter switch, featured flag and tags
are shared by all languages.

To add a language:

1. Copy `settings/resources/jsfaq.properties` to `settings/resources/jsfaq_<lang>.properties` and
   translate every value, tooltips included.
2. Copy `settings/locales/en.json` to `settings/locales/<lang>.json` and translate every value.
   Keep the same keys, and add the plural forms the language needs (`resultCount_one`,
   `resultCount_other`, plus `resultCount_many` and others where they apply, following i18next
   plural rules).
3. Rebuild, package and deploy.

## Development

### Scripts

Run from the repository root with Node 22 and Yarn 4 (`corepack enable`).

| Command        | Description                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| `yarn build`   | Type-checks (`tsc --noEmit`) and builds the server and client bundles (Vite) |
| `yarn test`    | Runs the unit tests (Vitest, `src/**/*.test.ts`)                             |
| `yarn lint`    | Runs ESLint                                                                  |
| `yarn format`  | Formats the repository with Prettier                                         |
| `yarn package` | Packs the module into `dist/package.tgz`                                     |
| `yarn deploy`  | Installs `dist/package.tgz` on a Jahia instance (`jahia-deploy`)             |
| `yarn dev`     | Rebuilds on change, then packages and deploys after each successful build    |
| `yarn release` | Builds and packs `dist/jsfaq-v<version>.tgz`                                 |
| `yarn clean`   | Removes `dist/`                                                              |

The unit tests cover the pure helpers: the allow-list for formatted text, heading placement, the
structured data and the text matching used by the search.

### Continuous integration

- `.github/workflows/ci.yml` runs on pushes and pull requests to `main`: install with
  `--immutable`, lint, unit tests, build (Node 22).
- `.github/workflows/build.yml` runs on every push: builds, packages and uploads `package.tgz` as a
  workflow artifact.

### Local Jahia

`docker-compose.yml` starts Jahia (`jahia/jahia-ee:8.2`) with PostgreSQL 16 on
`http://localhost:8080`, with the Java debug port on `9229`. The provisioning script in
`docker/provisioning.yml` installs `javascript-modules-engine` 1.0.1.

```bash
docker compose up -d
```

### Deploy to a local Jahia

`yarn deploy` posts `dist/package.tgz` to the Jahia provisioning API. It reads an optional `.env`
file at the repository root (ignored by Git):

```env
JAHIA_HOST=http://localhost:8080
JAHIA_USER=<user>:<password>
```

Without a `.env` file it targets `http://localhost:8080` with the default local credentials.
Prefer a dedicated deployment user over `root` outside a local machine.

```bash
yarn build && yarn package && yarn deploy
```

### Project layout

```
.
├── .github/workflows/       CI (lint, test, build) and package build
├── docker/                  Provisioning script for the local Jahia
├── docker-compose.yml       Local Jahia and PostgreSQL
├── settings/
│   ├── definitions.cnd      Namespaces and the jsfaqmix:component mixin
│   ├── content-types-icons/ Icon of the FAQ Components group
│   ├── locales/             Visitor-facing strings (en, fr, de, es)
│   └── resources/           Editor labels and tooltips (en, fr, de, es)
└── src/
    ├── components/
    │   ├── FaqPage/         FAQ Page type, server view, client island (search, filters,
    │   │                    expand/collapse, links to questions) and its text helpers
    │   ├── FaqSection/      FAQ Section type and server view
    │   └── FaqItem/         FAQ Item type, server view and disclosure markup
    ├── server/              Allow-list for formatted text, heading placement and node
    │                        helpers, structured data
    ├── styles/              faq.module.css (custom properties and styles)
    └── types.ts             schema.org FAQPage type
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

Released under the [MIT License](LICENSE).
