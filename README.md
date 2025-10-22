# Jahia FAQ Module# jsfaq — Jahia FAQ Module

A modern, SEO-optimized FAQ module for **Jahia 8.2+** built with JavaScript/TypeScript. This module provides a complete FAQ solution with server-side rendering, client-side interactivity, and schema.org structured data for enhanced search engine visibility.SEO-ready FAQ experience for Jahia. `jsfaq` renders semantic FAQ content server-side for instant readability, enriches pages with schema.org JSON-LD, and hydrates lightweight islands to power search, tag filtering, featured ordering, and collapsible questions without a Java backend.

## 🎯 Features## Key Features

- Server-rendered FAQPage markup with schema.org compliant JSON-LD (Question/Answer) emitted once per page.

### SEO & Performance- Search box with full-text matching on questions and answers, tag filters, featured-first ordering, and “copy link” shortcuts.

- **Schema.org JSON-LD**: Automatic FAQPage structured data generation for rich search results- Keyboard-accessible collapsible questions that preserve state via URL hashes (`#q-<uuid>`).

- **Server-Side Rendering**: Full content rendered server-side, works without JavaScript- Multilingual authoring with localized strings (EN/FR bundled) and JSON-driven hydrations.

- **Progressive Enhancement**: Interactive features added via client-side hydration- Lightweight <25 KB client island that lazy-loads on visibility and respects `prefers-reduced-motion`.

- **Keyword Highlighting**: Search terms automatically highlighted in results

## Installation & Build

### Interactive Features```bash

- **Real-time Search**: Full-text search across questions and answersyarn install # install dependencies

- **Collapsible Items**: Click to expand/collapse FAQ items with smooth animationsyarn build # emit dist/server and dist/client bundles

- **Auto-expand on Search**: Matching items automatically open with highlighted keywordsyarn package # produce dist/package.tgz ready for Jahia upload

- **Tag Filtering**: Filter questions by tags (if configured)```

- **URL Hash Support**: Deep linking to specific questions via URL fragments

## Authoring Workflow

### Developer Experience1. In Jahia, create a `jsfaqnt:faqPage`, provide the localized title and optional intro rich text.

- **TypeScript**: Full type safety throughout the codebase2. Add `jsfaqnt:faqSection` nodes for logical groups (title + description), then drop `jsfaqnt:faqItem` entries inside each section.

- **CSS Modules**: Scoped styling with no conflicts3. Use standalone `jsfaqnt:faqItem` children on the page for uncategorised questions.

- **Hot Reload**: Development mode with instant updates4. Populate question, answer (rich text), optional tags, `isFeatured`, and `order`. Publish when ready—SSR ensures LIVE pages work with JS disabled.

- **Modern Tooling**: Vite build system, ESLint, Prettier

## Architecture Overview

## 📋 Requirements

| Concern | Location / Notes |

- **Jahia**: Version 8.2 or higher| -------------------- | -------------------------------------------------- |

- **Node.js**: Version 22.0.0 or higher| Content Model | `settings/definitions.cnd` + `src/components/Faq*/definition.cnd` |

- **Yarn**: Version 4.10.3 (via Corepack)| Server Rendering | `src/components/FaqPage/default.server.tsx`, `src/components/FaqSection/default.server.tsx`, `src/components/FaqItem/default.server.tsx` (shared utilities in `src/components/FaqPage/serverUtils.tsx`) |

| Client Islands | `src/components/FaqPage/FaqPage.client.tsx` with presentational parts in `src/components/FaqPage/`, `src/components/FaqSection/`, `src/components/FaqItem/` |

## 🚀 Installation| GraphQL Helpers | `src/graphql/faq.ts` |

| JSON-LD Builder | `src/server/schemaOrg.ts` + HTML sanitizer in `src/server/sanitize.ts` |

### For Jahia Administrators| Styling | `src/styles/index.css` with CSS variables & focus states |

| Locales | `locales/en.json`, `locales/fr.json` |

1. Download the latest release package (`jsfaq-x.x.x.tgz`)

2. In Jahia Administration, go to **Server Settings → System Components → Modules**## Customization

3. Click **Upload Module** and select the package file- Theme via CSS custom properties (see `:root` tokens in `src/styles/index.css`).

4. The module will be automatically installed and started- Toggle features by adjusting island behaviour in `src/components/FaqPage/FaqPage.client.tsx` (e.g., disable featured-first or hash syncing).

- Extend GraphQL query fields in `src/graphql/faq.ts` when adding new properties to `jsfaqnt:*` types.

### For Developers

## Accessibility & i18n

```bash- Disclosure buttons carry `aria-expanded`/`aria-controls`; answers are mapped to accessible regions.

# Clone the repository- Focus rings remain visible; motion reduces automatically under `prefers-reduced-motion`.

git clone <repository-url>- Localized UI strings resolve through the `data-faq-props` payload, defaulting to English when a language file is missing.

cd jsfaq

## Validation

# Install dependencies- Confirm build integrity: `yarn build`.

yarn install- Upload `dist/package.tgz` to Jahia Modules. Content renders fully without client JavaScript.

- Validate the generated JSON-LD block using Google’s [Rich Results Test](https://search.google.com/test/rich-results).

# Build the module

yarn build

# Package for deployment

yarn package

# Deploy to Jahia (requires .env configuration)

yarn deploy

````

## 🔧 Development Setup

### Environment Configuration

Create a `.env` file in the project root:

```env
JAHIA_URL=http://localhost:8080
JAHIA_USERNAME=root
JAHIA_PASSWORD=your-password
````

### Available Scripts

```bash
yarn build          # Build production bundles
yarn dev            # Start development mode with watch
yarn package        # Create deployment package
yarn deploy         # Deploy to Jahia instance
yarn lint           # Run ESLint
yarn format         # Format code with Prettier
yarn clean          # Remove build artifacts
```

### Development Workflow

```bash
# Start development mode (auto-rebuild on changes)
yarn dev

# In another terminal, watch and deploy
yarn watch:callback
```

## 📝 Content Authoring

### Creating an FAQ Page

1. In Jahia Edit Mode, create a new page or content area
2. Add a **FAQ Page** component (`jsfaqnt:faqPage`)
3. Configure the page:
   - **Title**: Main heading for the FAQ
   - **Intro**: Optional introduction text (supports rich text)
   - **Featured First**: Toggle to show featured items first

### Adding FAQ Sections (Optional)

1. Inside the FAQ Page, add **FAQ Section** components (`jsfaqnt:faqSection`)
2. Configure each section:
   - **Section Title**: Heading for this group of questions
   - **Section Description**: Optional description (supports rich text)

### Adding FAQ Items

1. Add **FAQ Item** components (`jsfaqnt:faqItem`) either:
   - Inside FAQ Sections (for organized content)
   - Directly in the FAQ Page (for standalone questions)
2. Configure each item:
   - **Question**: The question text
   - **Answer**: The answer (supports rich text/HTML)
   - **Tags**: Comma-separated tags for filtering (optional)
   - **Featured**: Mark important questions to highlight them

### Content Structure Example

```
FAQ Page
├── FAQ Section: "Getting Started"
│   ├── FAQ Item: "How do I create an account?"
│   ├── FAQ Item: "What payment methods are accepted?"
│   └── FAQ Item: "Is there a mobile app?"
├── FAQ Section: "Troubleshooting"
│   ├── FAQ Item: "I forgot my password"
│   └── FAQ Item: "Why can't I log in?"
└── FAQ Item: "Contact support" (standalone)
```

## 🏗️ Architecture

### Content Types

| Node Type            | Description               | Key Properties                               |
| -------------------- | ------------------------- | -------------------------------------------- |
| `jsfaqnt:faqPage`    | Main FAQ container        | `jcr:title`, `intro`, `featuredFirstDefault` |
| `jsfaqnt:faqSection` | Optional section grouping | `sectionTitle`, `sectionDescription`         |
| `jsfaqnt:faqItem`    | Individual FAQ entry      | `question`, `answer`, `tags`, `featured`     |

### Project Structure

```
jsfaq/
├── src/
│   ├── components/
│   │   ├── FaqPage/
│   │   │   ├── default.server.tsx    # Server-side rendering
│   │   │   ├── FaqPage.client.tsx    # Client-side hydration
│   │   │   ├── definition.cnd         # Content type definition
│   │   │   └── ...                    # Sub-components
│   │   ├── FaqSection/
│   │   │   ├── default.server.tsx
│   │   │   ├── definition.cnd
│   │   │   └── FaqSection.tsx
│   │   └── FaqItem/
│   │       ├── default.server.tsx
│   │       ├── definition.cnd
│   │       └── FaqItem.tsx
│   ├── server/
│   │   ├── schemaOrg.ts              # JSON-LD generation
│   │   └── sanitize.ts               # HTML sanitization
│   ├── styles/
│   │   └── faq.module.css            # CSS modules styling
│   └── types.ts                       # TypeScript definitions
├── locales/
│   ├── en.json                        # English strings
│   └── fr.json                        # French strings
├── settings/
│   └── definitions.cnd                # Jahia content definitions
└── dist/                              # Build output
```

### Component Flow

1. **Server-Side**: `default.server.tsx` files render initial HTML with all content
2. **Data Serialization**: FAQ data serialized to JSON in a `<script>` tag
3. **Client Hydration**: `FaqPage.client.tsx` Island component adds interactivity
4. **Schema.org**: JSON-LD script automatically generated for SEO

## 🎨 Customization

### Styling

The module uses CSS Modules with scoped class names. To customize styles:

1. Edit `src/styles/faq.module.css`
2. Rebuild the module: `yarn build`

Key CSS classes:

- `.jsfaq` - Main container
- `.jsfaq__header` - Header section
- `.jsfaq__search` - Search bar container
- `.jsfaq-item` - Individual FAQ item
- `.jsfaq-item--open` - Opened item state

### Adding Custom Fields

1. Update content type in `src/components/Faq*/definition.cnd`
2. Update TypeScript types in `src/types.ts`
3. Modify server rendering in `default.server.tsx` files
4. Update client component if needed

### Internationalization

Add or modify translations in `locales/`:

```json
// locales/en.json
{
  "searchPlaceholder": "Search FAQ...",
  "noResults": "No results found",
  "featured": "Featured"
}
```

## 🔍 SEO Best Practices

### Structured Data

The module automatically generates FAQPage structured data that includes:

- All questions and answers
- Proper schema.org markup
- Plain text conversion of HTML answers

### Validation

Test your FAQ structured data:

1. Visit your FAQ page
2. Copy the URL
3. Use [Google Rich Results Test](https://search.google.com/test/rich-results)
4. Verify FAQPage markup is detected

### Search Engine Benefits

✅ Rich snippets in Google search results  
✅ Expandable Q&A directly in search  
✅ Better voice assistant integration  
✅ Improved page ranking for question queries

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactions
- **ARIA Labels**: Proper `aria-expanded`, `aria-controls`, and `aria-labelledby`
- **Focus Management**: Visible focus indicators
- **Screen Readers**: Semantic HTML with proper regions and landmarks
- **Reduced Motion**: Respects `prefers-reduced-motion` settings

## 🐛 Troubleshooting

### Items Don't Collapse

- Clear browser cache and reload
- Check browser console for JavaScript errors
- Verify the client bundle loaded: `/modules/jsfaq/dist/client/components/FaqPage/FaqPage.client.tsx.js`

### Search Not Working

- Ensure items contain text content
- Check that the FAQ data script tag is present: `<script type="application/json" data-faq-props>`
- Verify no JavaScript errors in console

### Schema.org Not Detected

- Use browser DevTools to find `<script type="application/ld+json">`
- Validate JSON structure is correct
- Ensure answers have content (empty answers are excluded)

## 📦 Build Output

After building, the module produces:

```
dist/
├── client/
│   └── components/FaqPage/
│       └── FaqPage.client.tsx.js      # ~8KB (gzipped: ~2.5KB)
├── server/
│   └── index.js                        # ~16KB
├── assets/
│   └── style.css                       # ~8KB
└── package.tgz                         # Deployment package
```

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📞 Support

For issues and questions:

- GitHub Issues: [repository-url]/issues
- Jahia Community: https://community.jahia.com

## 🔄 Version History

### 0.0.1 (Current)

- Initial release
- Server-side rendering with RenderChildren pattern
- Client-side search with keyword highlighting
- Collapsible items with smooth animations
- Schema.org FAQPage structured data
- CSS Modules styling
- EN/FR localization support
