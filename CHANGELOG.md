# jsfaq Changelog

## 1.1.1 (2026-10-01)

### Fixes

- The FAQ views read jsfaq's own translations on every page, also when the page renders components of other modules before the FAQ (labels could otherwise show their raw keys).

## 1.1.0 (2026-10-01)

### Accessibility (RGAA 4.1.2, WCAG 2.1 AA)

- Each question is a native disclosure (`<details>` / `<summary>`): it opens and closes without JavaScript, by keyboard and with assistive technologies.
- The heading level of the FAQ title is configurable, so the FAQ fits the outline of the page it sits in; questions follow one level below.
- Search announces its results, tag filters expose their pressed state, and links to a question open it and move focus to it.
- Controls that need JavaScript are hidden when scripts do not run.

### Content

- Formatted answers are rendered through an allow-list: headings follow the FAQ's outline, anchors inside an answer stay unique on the page, images without a text alternative are marked decorative and flagged to editors in edit mode.
- Schema.org FAQPage data matches the visible questions.
- A FAQ placed twice on a page keeps unique ids.

### Platform

- Requires Jahia 8.2.1 or later and the JavaScript modules engine 1.x.
- No dependency on jExperience.
- Unit tests (Vitest) run in CI.

## 1.0.0 (2025-10-22)

### Features

- Server-side rendering of the FAQ with its sections and questions (`jsfaqnt:faqPage`, `jsfaqnt:faqSection`, `jsfaqnt:faqItem`).
- Client-side search with keyword highlighting.
- Collapsible questions.
- Optional tag filtering.
- Schema.org FAQPage structured data.
- Translations in English, French, German and Spanish.
