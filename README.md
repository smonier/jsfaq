# jsfaq — Jahia FAQ Module

A modern, SEO-optimized FAQ module for **Jahia 8.2+** built with JavaScript/TypeScript. This module provides a complete FAQ solution with server-side rendering, client-side interactivity, and schema.org structured data for enhanced search engine visibility.A modern, SEO-optimized FAQ module for **Jahia 8.2+** built with JavaScript/TypeScript. This module provides a complete FAQ solution with server-side rendering, client-side interactivity, and schema.org structured data for enhanced search engine visibility.A modern, SEO-optimized FAQ module for **Jahia 8.2+** built with JavaScript/TypeScript. This module provides a complete FAQ solution with server-side rendering, client-side interactivity, and schema.org structured data for enhanced search engine visibility.SEO-ready FAQ experience for Jahia. `jsfaq` renders semantic FAQ content server-side for instant readability, enriches pages with schema.org JSON-LD, and hydrates lightweight islands to power search, tag filtering, featured ordering, and collapsible questions without a Java backend.

## 🎯 Features

### SEO & Performance### SEO & Performance## Key Features

- **Schema.org JSON-LD**: Automatic FAQPage structured data generation for rich search results- **Schema.org JSON-LD**: Automatic FAQPage structured data generation for rich search results- Server-rendered FAQPage markup with schema.org compliant JSON-LD (Question/Answer) emitted once per page.

- **Server-Side Rendering**: Full content rendered server-side, works without JavaScript

- **Progressive Enhancement**: Interactive features added via client-side hydration- **Server-Side Rendering**: Full content rendered server-side, works without JavaScript

- **Keyword Highlighting**: Search terms automatically highlighted in results

- **Progressive Enhancement**: Interactive features added via client-side hydration### SEO & Performance- Search box with full-text matching on questions and answers, tag filters, featured-first ordering, and “copy link” shortcuts.

### Interactive Features

- **Keyword Highlighting**: Search terms automatically highlighted in results

- **Real-time Search**: Full-text search across questions and answers

- **Collapsible Items**: Click to expand/collapse FAQ items with smooth animations- **Schema.org JSON-LD**: Automatic FAQPage structured data generation for rich search results- Keyboard-accessible collapsible questions that preserve state via URL hashes (`#q-<uuid>`).

- **Auto-expand on Search**: Matching items automatically open with highlighted keywords

- **Tag Filtering**: Filter questions by Jahia's native tags (`jmix:tagged`) with visual feedback### Interactive Features

- **Featured Items**: Highlight important questions

- **Server-Side Rendering**: Full content rendered server-side, works without JavaScript- Multilingual authoring with localized strings (EN/FR bundled) and JSON-driven hydrations.

### Developer Experience

- **Real-time Search**: Full-text search across questions and answers

- **TypeScript**: Full type safety throughout the codebase

- **CSS Modules**: Scoped styling with no conflicts- **Collapsible Items**: Click to expand/collapse FAQ items with smooth animations- **Progressive Enhancement**: Interactive features added via client-side hydration- Lightweight <25 KB client island that lazy-loads on visibility and respects `prefers-reduced-motion`.

- **Hot Reload**: Development mode with instant updates

- **Modern Tooling**: Vite build system, ESLint, Prettier- **Auto-expand on Search**: Matching items automatically open with highlighted keywords

## 📋 Requirements- **Tag Filtering**: Filter questions by Jahia's native tags (`jmix:tagged`)- **Keyword Highlighting**: Search terms automatically highlighted in results

- **Jahia**: Version 8.2 or higher- **Featured Items**: Highlight important questions

- **Node.js**: Version 22.0.0 or higher

- **Yarn**: Version 4.10.3 (via Corepack)## Installation & Build

## 🚀 Installation
### Developer Experience

### For Jahia Administrators
### Interactive Features

```bash

1. Download the latest release package (`jsfaq-x.x.x.tgz`) - **TypeScript**: Full type safety throughout the codebase

2. In Jahia Administration, go to **Server Settings → System Components → Modules**

3. Click **Upload Module** and select the package file- **CSS Modules**: Scoped styling with no conflicts- **Real-time Search**: Full-text search across questions and answersyarn install # install dependencies

4. The module will be automatically installed and started

- **Hot Reload**: Development mode with instant updates

### For Developers

- **Modern Tooling**: Vite build system, ESLint, Prettier- **Collapsible Items**: Click to expand/collapse FAQ items with smooth animationsyarn build # emit dist/server and dist/client bundles

````bash

# Clone the repository## 📋 Requirements- **Auto-expand on Search**: Matching items automatically open with highlighted keywordsyarn package # produce dist/package.tgz ready for Jahia upload

git clone <repository-url>

cd jsfaq- **Jahia**: Version 8.2 or higher- **Tag Filtering**: Filter questions by tags (if configured)```



# Install dependencies- **Node.js**: Version 22.0.0 or higher

yarn install

- **Yarn**: Version 4.10.3 (via Corepack)- **URL Hash Support**: Deep linking to specific questions via URL fragments

# Build the module

yarn build## 🚀 Installation## Authoring Workflow



# Package for deployment### For Jahia Administrators### Developer Experience1. In Jahia, create a `jsfaqnt:faqPage`, provide the localized title and optional intro rich text.

yarn package

1. Download the latest release package (`jsfaq-x.x.x.tgz`)- **TypeScript**: Full type safety throughout the codebase2. Add `jsfaqnt:faqSection` nodes for logical groups (title + description), then drop `jsfaqnt:faqItem` entries inside each section.

# Deploy to Jahia (requires .env configuration)

yarn deploy2. In Jahia Administration, go to **Server Settings → System Components → Modules**

````

3. Click **Upload Module** and select the package file- **CSS Modules**: Scoped styling with no conflicts3. Use standalone `jsfaqnt:faqItem` children on the page for uncategorised questions.

## 🔧 Development Setup

4. The module will be automatically installed and started

### Environment Configuration

- **Hot Reload**: Development mode with instant updates4. Populate question, answer (rich text), optional tags, `isFeatured`, and `order`. Publish when ready—SSR ensures LIVE pages work with JS disabled.

Create a `.env` file in the project root:

### For Developers

````env

JAHIA_URL=http://localhost:8080- **Modern Tooling**: Vite build system, ESLint, Prettier

JAHIA_USERNAME=root

JAHIA_PASSWORD=your-password```bash

````

# Clone the repository## Architecture Overview

### Available Scripts

git clone <repository-url>

```bash

yarn build          # Build production bundlescd jsfaq## 📋 Requirements

yarn dev            # Start development mode with watch

yarn package        # Create deployment package

yarn deploy         # Deploy to Jahia instance

yarn lint           # Run ESLint# Install dependencies| Concern | Location / Notes |

yarn format         # Format code with Prettier

yarn clean          # Remove build artifactsyarn install

```

- **Jahia**: Version 8.2 or higher| -------------------- | -------------------------------------------------- |

### Development Workflow

# Build the module

```bash

# Start development mode (auto-rebuild on changes)yarn build- **Node.js**: Version 22.0.0 or higher| Content Model | `settings/definitions.cnd` + `src/components/Faq*/definition.cnd` |

yarn dev



# In another terminal, watch and deploy

yarn watch:callback# Package for deployment- **Yarn**: Version 4.10.3 (via Corepack)| Server Rendering | `src/components/FaqPage/default.server.tsx`, `src/components/FaqSection/default.server.tsx`, `src/components/FaqItem/default.server.tsx` (shared utilities in `src/components/FaqPage/serverUtils.tsx`) |

```

yarn package

## 📝 Content Authoring

| Client Islands | `src/components/FaqPage/FaqPage.client.tsx` with presentational parts in `src/components/FaqPage/`, `src/components/FaqSection/`, `src/components/FaqItem/` |

### Creating an FAQ Page

# Deploy to Jahia (requires .env configuration)

1. In Jahia Edit Mode, create a new page or content area

2. Add a **FAQ Page** component (`jsfaqnt:faqPage`)yarn deploy## 🚀 Installation| GraphQL Helpers | `src/graphql/faq.ts` |

3. Configure the page:
   - **Title**: Main heading for the FAQ```

   - **Intro**: Optional introduction text (supports rich text)

| JSON-LD Builder | `src/server/schemaOrg.ts` + HTML sanitizer in `src/server/sanitize.ts` |

### Adding FAQ Sections (Optional)

## 🔧 Development Setup

1. Inside the FAQ Page, add **FAQ Section** components (`jsfaqnt:faqSection`)

2. Configure each section:### For Jahia Administrators| Styling | `src/styles/index.css` with CSS variables & focus states |
   - **Section Title**: Heading for this group of questions

   - **Section Description**: Optional description (supports rich text)### Environment Configuration

### Adding FAQ Items| Locales | `locales/en.json`, `locales/fr.json` |

1. Add **FAQ Item** components (`jsfaqnt:faqItem`) either:Create a `.env` file in the project root:
   - Inside FAQ Sections (for organized content)

   - Directly in the FAQ Page (for standalone questions)1. Download the latest release package (`jsfaq-x.x.x.tgz`)

2. Configure each item:
   - **Question**: The question text```env

   - **Answer**: The answer (supports rich text/HTML)

   - **Tags**: Use Jahia's native tagging (see below)JAHIA_URL=http://localhost:80802. In Jahia Administration, go to **Server Settings → System Components → Modules**## Customization

   - **Featured**: Mark important questions to highlight them

JAHIA_USERNAME=root

### Adding Tags to FAQ Items

JAHIA_PASSWORD=your-password3. Click **Upload Module** and select the package file- Theme via CSS custom properties (see `:root` tokens in `src/styles/index.css`).

This module uses **Jahia's native tagging system** (`jmix:tagged`):

`````

1. The `jsfaqnt:faqItem` content type includes the `jmix:tagged` mixin

2. Use Jahia's standard tag picker in the content editor4. The module will be automatically installed and started- Toggle features by adjusting island behaviour in `src/components/FaqPage/FaqPage.client.tsx` (e.g., disable featured-first or hash syncing).

3. Tags automatically appear as:

   - **Filter buttons** at the top of the FAQ page (clickable to filter questions)### Available Scripts

   - Selected tags show visual feedback with darker styling

   - **Small badges** below each answer when expanded- Extend GraphQL query fields in `src/graphql/faq.ts` when adding new properties to `jsfaqnt:*` types.

4. Tag badges are displayed only when the FAQ item is expanded (collapsed by default)

````bash

**Note**: Tags are stored in Jahia's standard `j:tagList` property, ensuring compatibility with Jahia's built-in tagging features.

yarn build          # Build production bundles### For Developers

### Content Structure Example

yarn dev            # Start development mode with watch

`````

FAQ Pageyarn package # Create deployment package## Accessibility & i18n

├── FAQ Section: "Getting Started"

│ ├── FAQ Item: "How do I create an account?"yarn deploy # Deploy to Jahia instance

│ ├── FAQ Item: "What payment methods are accepted?"

│ └── FAQ Item: "Is there a mobile app?"yarn lint # Run ESLint```bash

├── FAQ Section: "Troubleshooting"

│ ├── FAQ Item: "I forgot my password"yarn format # Format code with Prettier- Disclosure buttons carry `aria-expanded`/`aria-controls`; answers are mapped to accessible regions.

│ └── FAQ Item: "Why can't I log in?"

└── FAQ Item: "Contact support" (standalone)yarn clean # Remove build artifacts

````

```# Clone the repository- Focus rings remain visible; motion reduces automatically under `prefers-reduced-motion`.

## 🏗️ Architecture



### Content Types

### Development Workflowgit clone <repository-url>- Localized UI strings resolve through the `data-faq-props` payload, defaulting to English when a language file is missing.

| Node Type | Description | Key Properties | Mixins |

| --------- | ----------- | -------------- | ------ |

| `jsfaqnt:faqPage` | Main FAQ container | `jcr:title`, `intro` | - |

| `jsfaqnt:faqSection` | Optional section grouping | `sectionTitle`, `sectionDescription` | - |```bashcd jsfaq

| `jsfaqnt:faqItem` | Individual FAQ entry | `question`, `answer`, `featured` | `jmix:tagged` |

# Start development mode (auto-rebuild on changes)

**Note**: Tags are managed through Jahia's native `jmix:tagged` mixin using the `j:tagList` property.

yarn dev## Validation

### Project Structure



````

jsfaq/# In another terminal, watch and deploy# Install dependencies- Confirm build integrity: `yarn build`.

├── src/

│ ├── components/yarn watch:callback

│ │ ├── FaqPage/

│ │ │ ├── default.server.tsx # Server-side rendering```yarn install- Upload `dist/package.tgz` to Jahia Modules. Content renders fully without client JavaScript.

│ │ │ ├── FaqPage.client.tsx # Client-side hydration (Island)

│ │ │ ├── definition.cnd # Content type definition

│ │ │ └── ... # Sub-components

│ │ ├── FaqSection/## 📝 Content Authoring- Validate the generated JSON-LD block using Google’s [Rich Results Test](https://search.google.com/test/rich-results).

│ │ │ ├── default.server.tsx

│ │ │ ├── definition.cnd

│ │ │ └── FaqSection.tsx

│ │ └── FaqItem/### Creating an FAQ Page# Build the module

│ │ ├── default.server.tsx

│ │ ├── definition.cnd

│ │ └── FaqItem.tsx

│ ├── server/1. In Jahia Edit Mode, create a new page or content areayarn build

│ │ ├── schemaOrg.ts # JSON-LD generation

│ │ └── sanitize.ts # HTML sanitization2. Add a **FAQ Page** component (`jsfaqnt:faqPage`)

│ ├── styles/

│ │ └── faq.module.css # CSS modules styling3. Configure the page:# Package for deployment

│ └── types.ts # TypeScript definitions

├── locales/ - **Title**: Main heading for the FAQ

│ ├── en.json # English strings

│ └── fr.json # French strings - **Intro**: Optional introduction text (supports rich text)yarn package

├── settings/

│ └── definitions.cnd # Jahia content definitions - **Featured First**: Toggle to show featured items first

└── dist/ # Build output

````# Deploy to Jahia (requires .env configuration)



### Component Flow### Adding FAQ Sections (Optional)



1. **Server-Side**: `default.server.tsx` files render initial HTML with all contentyarn deploy

2. **Data Serialization**: FAQ data serialized to JSON in a `<script>` tag

3. **Client Hydration**: `FaqPage.client.tsx` Island component adds interactivity1. Inside the FAQ Page, add **FAQ Section** components (`jsfaqnt:faqSection`)

4. **Schema.org**: JSON-LD script automatically generated for SEO

2. Configure each section:```

## 🎨 Customization

   - **Section Title**: Heading for this group of questions

### Styling

   - **Section Description**: Optional description (supports rich text)## 🔧 Development Setup

The module uses CSS Modules with scoped class names. To customize styles:



1. Edit `src/styles/faq.module.css`

2. Rebuild the module: `yarn build`### Adding FAQ Items### Environment Configuration



Key CSS classes:



- `.jsfaq` - Main container1. Add **FAQ Item** components (`jsfaqnt:faqItem`) either:Create a `.env` file in the project root:

- `.jsfaq__header` - Header section

- `.jsfaq__search` - Search bar container   - Inside FAQ Sections (for organized content)

- `.jsfaq-item` - Individual FAQ item

- `.jsfaq-item--open` - Opened item state   - Directly in the FAQ Page (for standalone questions)```env

- `.jsfaq-item__tag` - Individual tag badges (0.75rem, 12px radius)

- `.jsfaq-tag` - Tag filter buttons2. Configure each item:JAHIA_URL=http://localhost:8080

- `.jsfaq-tag--active` - Active/selected tag button state

   - **Question**: The question textJAHIA_USERNAME=root

### Adding Custom Fields

   - **Answer**: The answer (supports rich text/HTML)JAHIA_PASSWORD=your-password

1. Update content type in `src/components/Faq*/definition.cnd`

2. Update TypeScript types in `src/types.ts`   - **Tags**: Use Jahia's native tagging (see below)```

3. Modify server rendering in `default.server.tsx` files

4. Update client component if needed   - **Featured**: Mark important questions to highlight them



### Internationalization### Available Scripts



Add or modify translations in `locales/`:### Adding Tags to FAQ Items



```json```bash

// locales/en.json

{This module uses **Jahia's native tagging system** via the `jmix:tagged` mixin:yarn build          # Build production bundles

  "searchPlaceholder": "Search FAQ...",

  "noResults": "No results found",yarn dev            # Start development mode with watch

  "featured": "Featured",

  "tagsLabel": "Filter by tags"1. The `jsfaqnt:faqItem` content type automatically includes the `jmix:tagged` mixinyarn package        # Create deployment package

}

```2. In the content editor, use Jahia's standard tag picker to add tags to any FAQ itemyarn deploy         # Deploy to Jahia instance



## 🔍 SEO Best Practices3. Tags appear in two places:yarn lint           # Run ESLint



### Structured Data   - **Filter buttons** at the top of the FAQ page (click to filter questions by tag)yarn format         # Format code with Prettier



The module automatically generates FAQPage structured data that includes:   - **Small badges** below each answer when the item is expandedyarn clean          # Remove build artifacts



- All questions and answers4. Tags are only visible when the FAQ item is expanded (items start collapsed by default)```

- Proper schema.org markup

- Plain text conversion of HTML answers



Example JSON-LD output:**Note**: Tags are stored in Jahia's standard `j:tagList` property, ensuring compatibility with Jahia's built-in tagging features.### Development Workflow



```json

{

  "@context": "https://schema.org",### Content Structure Example```bash

  "@type": "FAQPage",

  "mainEntity": [# Start development mode (auto-rebuild on changes)

    {

      "@type": "Question",```yarn dev

      "name": "How do I create an account?",

      "acceptedAnswer": {FAQ Page

        "@type": "Answer",

        "text": "To create an account, click the Sign Up button..."├── FAQ Section: "Getting Started"# In another terminal, watch and deploy

      }

    }│   ├── FAQ Item: "How do I create an account?"yarn watch:callback

  ]

}│   ├── FAQ Item: "What payment methods are accepted?"```

````

│ └── FAQ Item: "Is there a mobile app?"

### Validation

├── FAQ Section: "Troubleshooting"## 📝 Content Authoring

Test your FAQ structured data:

│ ├── FAQ Item: "I forgot my password"

1. Visit your FAQ page

2. Copy the URL│ └── FAQ Item: "Why can't I log in?"### Creating an FAQ Page

3. Use [Google Rich Results Test](https://search.google.com/test/rich-results)

4. Verify FAQPage markup is detected└── FAQ Item: "Contact support" (standalone)

### Search Engine Benefits```1. In Jahia Edit Mode, create a new page or content area

✅ Rich snippets in Google search results 2. Add a **FAQ Page** component (`jsfaqnt:faqPage`)

✅ Expandable Q&A directly in search

✅ Better voice assistant integration ## 🏗️ Architecture3. Configure the page:

✅ Improved page ranking for question queries

- **Title**: Main heading for the FAQ

## ♿ Accessibility

### Content Types - **Intro**: Optional introduction text (supports rich text)

- **Keyboard Navigation**: Full keyboard support for all interactions

- **ARIA Labels**: Proper `aria-expanded`, `aria-controls`, `aria-pressed`, and `aria-labelledby` - **Featured First**: Toggle to show featured items first

- **Focus Management**: Visible focus indicators

- **Screen Readers**: Semantic HTML with proper regions and landmarks| Node Type | Description | Key Properties | Mixins |

- **Reduced Motion**: Respects `prefers-reduced-motion` settings

| -------------------- | ------------------------- | -------------------------------------------- | ------------- |### Adding FAQ Sections (Optional)

## 🐛 Troubleshooting

| `jsfaqnt:faqPage` | Main FAQ container | `jcr:title`, `intro`, `featuredFirstDefault` | - |

### Items Don't Collapse

| `jsfaqnt:faqSection` | Optional section grouping | `sectionTitle`, `sectionDescription` | - |1. Inside the FAQ Page, add **FAQ Section** components (`jsfaqnt:faqSection`)

- Clear browser cache and reload

- Check browser console for JavaScript errors| `jsfaqnt:faqItem` | Individual FAQ entry | `question`, `answer`, `featured` | `jmix:tagged` |2. Configure each section:

- Verify the client bundle loaded: `/modules/jsfaq/dist/client/components/FaqPage/FaqPage.client.tsx.js`
  - **Section Title**: Heading for this group of questions

### Search Not Working

**Note**: Tags are managed through Jahia's native `jmix:tagged` mixin using the `j:tagList` property, which is a multi-value string array. - **Section Description**: Optional description (supports rich text)

- Ensure items contain text content

- Check that the FAQ data script tag is present: `<script type="application/json" data-faq-props>`

- Verify no JavaScript errors in console

### Project Structure### Adding FAQ Items

### Tag Filters Not Showing

- Verify that at least one FAQ item has tags assigned

- Check that tags are added in Jahia's content editor using the tag picker```1. Add **FAQ Item** components (`jsfaqnt:faqItem`) either:

- Tag filter buttons only appear when there are tags to display

- View the HTML source to confirm `j:tagList` property contains valuesjsfaq/ - Inside FAQ Sections (for organized content)

### Tag Selection Not Visible├── src/ - Directly in the FAQ Page (for standalone questions)

- Check that the `data-faq-tag-active-class` attribute is present on the FAQ root element│ ├── components/2. Configure each item:

- Verify CSS modules are loading correctly

- Selected tags should have darker background and bold text│ │ ├── FaqPage/ - **Question**: The question text

### Schema.org Not Detected│ │ │ ├── default.server.tsx # Server-side rendering - **Answer**: The answer (supports rich text/HTML)

- Use browser DevTools to find `<script type="application/ld+json">`│ │ │ ├── FaqPage.client.tsx # Client-side hydration (Island) - **Tags**: Use Jahia's native tagging (mixin `jmix:tagged` with `j:tagList` property)

- Validate JSON structure is correct

- Ensure answers have content (empty answers are excluded)│ │ │ ├── definition.cnd # Content type definition - **Featured**: Mark important questions to highlight them

## 📦 Build Output│ │ │ └── ... # Sub-components

After building, the module produces:│ │ ├── FaqSection/### Adding Tags to FAQ Items

`````│ │   │   ├── default.server.tsx

dist/

├── client/│   │   │   ├── definition.cndThis module uses **Jahia's native tagging system** (`jmix:tagged`):

│   └── components/FaqPage/

│       └── FaqPage.client.tsx.js      # ~8KB (gzipped: ~2.5KB)│   │   │   └── FaqSection.tsx

├── server/

│   └── index.js                        # ~18KB│   │   └── FaqItem/1. The `jsfaqnt:faqItem` content type includes the `jmix:tagged` mixin

├── assets/

│   └── style.css                       # ~8KB│   │       ├── default.server.tsx2. Use Jahia's standard tag picker in the content editor

└── package.tgz                         # Deployment package

```│   │       ├── definition.cnd3. Tags automatically appear as:



## 📄 License│   │       └── FaqItem.tsx   - **Filter buttons** at the top of the FAQ page (clickable to filter questions)



[Add your license here]│   ├── server/   - **Small badges** below each answer when expanded



## 🤝 Contributing│   │   ├── schemaOrg.ts              # JSON-LD generation4. Tags are displayed only when the FAQ item is expanded (collapsed by default)



[Add contribution guidelines here]│   │   └── sanitize.ts               # HTML sanitization



## 📞 Support│   ├── styles/### Content Structure Example



For issues and questions:│   │   └── faq.module.css            # CSS modules styling



- GitHub Issues: [repository-url]/issues│   └── types.ts                       # TypeScript definitions```

- Jahia Community: https://community.jahia.com

├── locales/FAQ Page

## 🔄 Version History

│   ├── en.json                        # English strings├── FAQ Section: "Getting Started"

### 0.0.1 (Current)

│   └── fr.json                        # French strings│   ├── FAQ Item: "How do I create an account?"

- Initial release

- Server-side rendering with RenderChildren pattern├── settings/│   ├── FAQ Item: "What payment methods are accepted?"

- Client-side search with keyword highlighting

- Collapsible items with smooth animations│   └── definitions.cnd                # Jahia content definitions│   └── FAQ Item: "Is there a mobile app?"

- Schema.org FAQPage structured data

- CSS Modules styling└── dist/                              # Build output├── FAQ Section: "Troubleshooting"

- EN/FR localization support

- **Native Jahia tagging**: Uses `jmix:tagged` mixin with `j:tagList` property```│   ├── FAQ Item: "I forgot my password"

- Tag filtering with visual feedback for selected tags

- Tag badges display inside collapsible answers│   └── FAQ Item: "Why can't I log in?"



---### Component Flow└── FAQ Item: "Contact support" (standalone)



Built with ❤️ for Jahia 8.2+````


1. **Server-Side**: `default.server.tsx` files render initial HTML with all content

2. **Data Serialization**: FAQ data serialized to JSON in a `<script>` tag## 🏗️ Architecture

3. **Client Hydration**: `FaqPage.client.tsx` Island component adds interactivity

4. **Schema.org**: JSON-LD script automatically generated for SEO### Content Types

### Server-Side Rendering| Node Type | Description | Key Properties | Mixins |

| -------------------- | ------------------------- | -------------------------------------------- | ------------- |

Each component has a `default.server.tsx` file that:| `jsfaqnt:faqPage` | Main FAQ container | `jcr:title`, `intro`, `featuredFirstDefault` | - |

| `jsfaqnt:faqSection` | Optional section grouping | `sectionTitle`, `sectionDescription` | - |

- Retrieves content from Jahia JCR| `jsfaqnt:faqItem` | Individual FAQ entry | `question`, `answer`, `featured` | `jmix:tagged` |

- Uses `RenderChildren` helper for nested components

- Renders semantic HTML**Note:** Tags are managed through Jahia's native `jmix:tagged` mixin using the `j:tagList` property.

- Serializes data for client hydration

### Project Structure

### Client-Side Islands

`````

The `FaqPage.client.tsx` Island component provides:jsfaq/

├── src/

- Search functionality with keyword highlighting│ ├── components/

- Collapsible items (start closed, auto-expand on search)│ │ ├── FaqPage/

- Tag filtering│ │ │ ├── default.server.tsx # Server-side rendering

- Featured item ordering│ │ │ ├── FaqPage.client.tsx # Client-side hydration

- State management│ │ │ ├── definition.cnd # Content type definition

│ │ │ └── ... # Sub-components

## 🎨 Customization│ │ ├── FaqSection/

│ │ │ ├── default.server.tsx

### Styling│ │ │ ├── definition.cnd

│ │ │ └── FaqSection.tsx

The module uses CSS Modules with scoped class names. To customize styles:│ │ └── FaqItem/

│ │ ├── default.server.tsx

1. Edit `src/styles/faq.module.css`│ │ ├── definition.cnd

2. Rebuild the module: `yarn build`│ │ └── FaqItem.tsx

│ ├── server/

Key CSS classes:│ │ ├── schemaOrg.ts # JSON-LD generation

│ │ └── sanitize.ts # HTML sanitization

- `.jsfaq` - Main container│ ├── styles/

- `.jsfaq__header` - Header section│ │ └── faq.module.css # CSS modules styling

- `.jsfaq__search` - Search bar container│ └── types.ts # TypeScript definitions

- `.jsfaq-item` - Individual FAQ item├── locales/

- `.jsfaq-item--open` - Opened item state│ ├── en.json # English strings

- `.jsfaq-item__tag` - Individual tag badges (0.75rem, 12px radius)│ └── fr.json # French strings

- `.jsfaq-tag` - Tag filter buttons├── settings/

│ └── definitions.cnd # Jahia content definitions

### Adding Custom Fields└── dist/ # Build output

`````

1. Update content type in `src/components/Faq*/definition.cnd`

2. Update TypeScript types in `src/types.ts`### Component Flow

3. Modify server rendering in `default.server.tsx` files

4. Update client component if needed1. **Server-Side**: `default.server.tsx` files render initial HTML with all content

5. **Data Serialization**: FAQ data serialized to JSON in a `<script>` tag

### Internationalization3. **Client Hydration**: `FaqPage.client.tsx` Island component adds interactivity

4. **Schema.org**: JSON-LD script automatically generated for SEO

Add or modify translations in `locales/`:

## 🎨 Customization

````json

// locales/en.json### Styling

{

  "searchPlaceholder": "Search FAQ...",The module uses CSS Modules with scoped class names. To customize styles:

  "noResults": "No results found",

  "featured": "Featured",1. Edit `src/styles/faq.module.css`

  "allTags": "All"2. Rebuild the module: `yarn build`

}

```Key CSS classes:



## 🔍 SEO Best Practices- `.jsfaq` - Main container

- `.jsfaq__header` - Header section

### Structured Data- `.jsfaq__search` - Search bar container

- `.jsfaq-item` - Individual FAQ item

The module automatically generates FAQPage structured data that includes:- `.jsfaq-item--open` - Opened item state



- All questions and answers### Adding Custom Fields

- Proper schema.org markup

- Plain text conversion of HTML answers1. Update content type in `src/components/Faq*/definition.cnd`

2. Update TypeScript types in `src/types.ts`

Example JSON-LD output:3. Modify server rendering in `default.server.tsx` files

4. Update client component if needed

```json

{### Internationalization

  "@context": "https://schema.org",

  "@type": "FAQPage",Add or modify translations in `locales/`:

  "mainEntity": [

    {```json

      "@type": "Question",// locales/en.json

      "name": "How do I create an account?",{

      "acceptedAnswer": {  "searchPlaceholder": "Search FAQ...",

        "@type": "Answer",  "noResults": "No results found",

        "text": "To create an account, click the Sign Up button..."  "featured": "Featured"

      }}

    }```

  ]

}## 🔍 SEO Best Practices

`````

### Structured Data

### Validation

The module automatically generates FAQPage structured data that includes:

Test your FAQ structured data:

- All questions and answers

1. Visit your FAQ page- Proper schema.org markup

2. Copy the URL- Plain text conversion of HTML answers

3. Use [Google Rich Results Test](https://search.google.com/test/rich-results)

4. Verify FAQPage markup is detected### Validation

### Search Engine BenefitsTest your FAQ structured data:

✅ Rich snippets in Google search results 1. Visit your FAQ page

✅ Expandable Q&A directly in search 2. Copy the URL

✅ Better voice assistant integration 3. Use [Google Rich Results Test](https://search.google.com/test/rich-results)

✅ Improved page ranking for question queries4. Verify FAQPage markup is detected

## ♿ Accessibility### Search Engine Benefits

- **Keyboard Navigation**: Full keyboard support for all interactions✅ Rich snippets in Google search results

- **ARIA Labels**: Proper `aria-expanded`, `aria-controls`, and `aria-labelledby`✅ Expandable Q&A directly in search

- **Focus Management**: Visible focus indicators✅ Better voice assistant integration

- **Screen Readers**: Semantic HTML with proper regions and landmarks✅ Improved page ranking for question queries

- **Reduced Motion**: Respects `prefers-reduced-motion` settings

## ♿ Accessibility

## 🐛 Troubleshooting

- **Keyboard Navigation**: Full keyboard support for all interactions

### Items Don't Collapse- **ARIA Labels**: Proper `aria-expanded`, `aria-controls`, and `aria-labelledby`

- **Focus Management**: Visible focus indicators

- Clear browser cache and reload- **Screen Readers**: Semantic HTML with proper regions and landmarks

- Check browser console for JavaScript errors- **Reduced Motion**: Respects `prefers-reduced-motion` settings

- Verify the client bundle loaded: `/modules/jsfaq/dist/client/components/FaqPage/FaqPage.client.tsx.js`

## 🐛 Troubleshooting

### Search Not Working

### Items Don't Collapse

- Ensure items contain text content

- Check that the FAQ data script tag is present: `<script type="application/json" data-faq-props>`- Clear browser cache and reload

- Verify no JavaScript errors in console- Check browser console for JavaScript errors

- Verify the client bundle loaded: `/modules/jsfaq/dist/client/components/FaqPage/FaqPage.client.tsx.js`

### Tags Not Showing

### Search Not Working

- Verify that the `jmix:tagged` mixin is applied to FAQ items

- Check that tags are added in Jahia's content editor using the tag picker- Ensure items contain text content

- Tags only appear when FAQ items are expanded (collapsed by default)- Check that the FAQ data script tag is present: `<script type="application/json" data-faq-props>`

- View the HTML source to confirm `j:tagList` property contains values- Verify no JavaScript errors in console

### Schema.org Not Detected### Schema.org Not Detected

- Use browser DevTools to find `<script type="application/ld+json">`- Use browser DevTools to find `<script type="application/ld+json">`

- Validate JSON structure is correct- Validate JSON structure is correct

- Ensure answers have content (empty answers are excluded)- Ensure answers have content (empty answers are excluded)

## 📦 Build Output## 📦 Build Output

After building, the module produces:After building, the module produces:

```

dist/dist/

├── client/├── client/

│   └── components/FaqPage/│   └── components/FaqPage/

│       └── FaqPage.client.tsx.js      # ~8KB (gzipped: ~2.5KB)│       └── FaqPage.client.tsx.js      # ~8KB (gzipped: ~2.5KB)

├── server/├── server/

│   └── index.js                        # ~17KB│   └── index.js                        # ~16KB

├── assets/├── assets/

│   └── faq.module.css                  # ~8KB│   └── style.css                       # ~8KB

└── package.tgz                         # Deployment package└── package.tgz                         # Deployment package

```

## 📄 License## 📄 License

[Add your license here][Add your license here]

## 🤝 Contributing## 🤝 Contributing

[Add contribution guidelines here][Add contribution guidelines here]

## 📞 Support## 📞 Support

For issues and questions:For issues and questions:

- GitHub Issues: [repository-url]/issues- GitHub Issues: [repository-url]/issues

- Jahia Community: https://community.jahia.com- Jahia Community: https://community.jahia.com

## 🔄 Version History## 🔄 Version History

### 0.0.1 (Current)### 0.0.1 (Current)

- Initial release- Initial release

- Server-side rendering with RenderChildren pattern- Server-side rendering with RenderChildren pattern

- Client-side search with keyword highlighting- Client-side search with keyword highlighting

- Collapsible items with smooth animations- Collapsible items with smooth animations

- Schema.org FAQPage structured data- Schema.org FAQPage structured data

- CSS Modules styling- CSS Modules styling

- EN/FR localization support- EN/FR localization support

- **Native Jahia tagging**: Uses `jmix:tagged` mixin with `j:tagList` property
- Tag filtering and badge display

---

Built with ❤️ for Jahia 8.2+
