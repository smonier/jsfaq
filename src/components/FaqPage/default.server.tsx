import {
  AddResources,
  Island,
  buildModuleFileUrl,
  jahiaComponent,
  RenderChildren,
  getNodeProps,
} from "@jahia/javascript-modules-library";
import type { RenderContext, Resource } from "org.jahia.services.render";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import FaqPageClient from "./FaqPage.client";
import classes from "../../styles/faq.module.css";
import type { FaqInitialProps, FaqPage, FaqSection, FaqItem } from "../../types";
import { buildFaqJsonLd } from "../../server/schemaOrg";

type ServerProps = Record<string, unknown>;
type ServerContext = {
  renderContext?: RenderContext;
  currentResource?: Resource;
};

// Helper to get child nodes
const getChildNodes = (node: JCRNodeWrapper): JCRNodeWrapper[] => {
  try {
    if (!node || typeof node.getNodes !== "function") return [];
    const iterator = node.getNodes();
    const children: JCRNodeWrapper[] = [];
    while (iterator.hasNext()) {
      children.push(iterator.nextNode() as JCRNodeWrapper);
    }
    return children;
  } catch {
    return [];
  }
};

// Helper to get tags from Jahia's jmix:tagged
const getTags = (node: JCRNodeWrapper): string[] => {
  try {
    if (!node.hasProperty || !node.hasProperty("j:tagList")) return [];

    // Try to get as property which might return an array
    const property = node.getProperty("j:tagList");
    if (!property) return [];

    // Check if it's a multi-valued property
    if (property.isMultiple && property.isMultiple()) {
      const values = property.getValues();
      const tagArray: string[] = [];
      for (let i = 0; i < values.length; i++) {
        const val = values[i].getString();
        if (val) tagArray.push(val);
      }
      return tagArray;
    }

    // Single value - split by comma if needed
    const tagList = property.getString();
    if (!tagList) return [];
    return String(tagList)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
};

jahiaComponent(
  {
    nodeType: "jsfaqnt:faqPage",
    componentType: "view",
    displayName: "FAQ Page",
  },
  (_props: ServerProps, context: ServerContext) => {
    const { renderContext, currentResource } = context;

    // Get current node
    const node = (() => {
      try {
        if (!currentResource || typeof currentResource.getNode !== "function") return null;
        return currentResource.getNode() as JCRNodeWrapper;
      } catch {
        return null;
      }
    })();

    if (!node) {
      return (
        <div className={classes["jsfaq-error"]}>
          <p>FAQ content unavailable.</p>
        </div>
      );
    }

    // Get basic page properties
    const props = getNodeProps<Record<string, unknown>>(node, [
      "jcr:title",
      "intro",
      "featuredFirstDefault",
    ]);

    const title = String(props["jcr:title"] || "FAQ");
    const introHtml = String(props["intro"] || "");
    const featuredFirstDefault = Boolean(props["featuredFirstDefault"]);

    // Collect all FAQ data for client-side hydration
    const language = renderContext?.getMainResourceLocale()?.toString() || null;
    const childNodes = getChildNodes(node);

    const sections: FaqSection[] = [];
    const directItems: FaqItem[] = [];
    const allTags = new Set<string>();

    for (const child of childNodes) {
      const nodeType = child.getPrimaryNodeTypeName();

      if (nodeType === "jsfaqnt:faqSection") {
        const sectionProps = getNodeProps<Record<string, unknown>>(child, [
          "sectionTitle",
          "sectionDescription",
        ]);
        const sectionItems: FaqItem[] = [];

        // Get items within this section
        const sectionChildren = getChildNodes(child);
        for (const sectionChild of sectionChildren) {
          if (sectionChild.getPrimaryNodeTypeName() === "jsfaqnt:faqItem") {
            const itemProps = getNodeProps<Record<string, unknown>>(sectionChild, [
              "question",
              "answer",
              "featured",
            ]);
            const tags = getTags(sectionChild);

            tags.forEach((tag) => allTags.add(tag));

            const answerHtml = String(itemProps.answer || "");
            sectionItems.push({
              uuid: sectionChild.getIdentifier(),
              question: String(itemProps.question || ""),
              answerHtml,
              answerText: answerHtml.replace(/<[^>]*>/g, ""),
              tags: tags.length > 0 ? tags : undefined,
              isFeatured: Boolean(itemProps.featured),
            });
          }
        }

        sections.push({
          uuid: child.getIdentifier(),
          sectionTitle: String(sectionProps.sectionTitle || ""),
          sectionDescription: sectionProps.sectionDescription
            ? String(sectionProps.sectionDescription)
            : undefined,
          items: sectionItems,
        });
      } else if (nodeType === "jsfaqnt:faqItem") {
        const itemProps = getNodeProps<Record<string, unknown>>(child, [
          "question",
          "answer",
          "featured",
        ]);
        const tags = getTags(child);

        tags.forEach((tag) => allTags.add(tag));

        const answerHtml = String(itemProps.answer || "");
        directItems.push({
          uuid: child.getIdentifier(),
          question: String(itemProps.question || ""),
          answerHtml,
          answerText: answerHtml.replace(/<[^>]*>/g, ""),
          tags: tags.length > 0 ? tags : undefined,
          isFeatured: Boolean(itemProps.featured),
        });
      }
    }

    // Build initial props for client
    const faqPage: FaqPage = {
      uuid: node.getIdentifier(),
      title,
      introHtml: introHtml || undefined,
      sections,
      items: directItems,
    };

    const initialProps: FaqInitialProps = {
      page: faqPage,
      tags: Array.from(allTags).sort(),
      language,
      featuredFirstDefault,
      strings: {
        searchPlaceholder: "Search FAQ...",
        clearFilters: "Clear filters",
        featured: "Featured",
        featuredFirst: "Featured first",
        tagsLabel: "Filter by tags",
        copyLink: "Copy link",
        copied: "Copied!",
        copyLinkSuccess: "Link copied to clipboard",
        copyLinkError: "Failed to copy link",
        questionsHeading: "Questions",
        noResults: "No results found",
        expandAll: "Expand all",
        collapseAll: "Collapse all",
      },
    };

    const cssResource = (() => {
      try {
        return buildModuleFileUrl("dist/assets/style.css");
      } catch {
        return "/modules/jsfaq/dist/assets/style.css";
      }
    })();

    return (
      <section className={classes["jsfaq-ssr-wrapper"]}>
        <AddResources type="css" resources={cssResource} />

        <article
          className={classes.jsfaq}
          data-faq-root
          data-faq-open-class={classes["jsfaq-item--open"]}
          data-faq-tag-active-class={classes["jsfaq-tag--active"]}
        >
          <header className={classes.jsfaq__header}>
            <h1 className={classes.jsfaq__title}>{title}</h1>
            {introHtml ? (
              <div
                className={classes.jsfaq__intro}
                dangerouslySetInnerHTML={{ __html: introHtml }}
              />
            ) : null}
          </header>

          {/* Search bar */}
          <div className={classes["jsfaq__search"]}>
            <input
              type="search"
              className={classes["jsfaq__search-input"]}
              placeholder="Search FAQ..."
              data-faq-search
              aria-label="Search FAQ"
            />
          </div>

          {/* Tag filter buttons */}
          {allTags.size > 0 && (
            <div
              className={classes["jsfaq-tags"]}
              role="group"
              aria-label="Filter by tags"
              data-faq-tags
            >
              {Array.from(allTags)
                .sort()
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={classes["jsfaq-tag"]}
                    data-faq-tag={tag}
                    aria-pressed="false"
                  >
                    {tag}
                  </button>
                ))}
            </div>
          )}

          <div className={classes.jsfaq__content}>
            {/* Render all child components (sections and items) */}
            <RenderChildren />
          </div>
        </article>

        {/* Serialize FAQ data for client-side hydration */}
        <script
          type="application/json"
          data-faq-props
          dangerouslySetInnerHTML={{ __html: JSON.stringify(initialProps) }}
        />

        {/* Schema.org structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildFaqJsonLd(faqPage) }}
        />

        <Island component={FaqPageClient} />
      </section>
    );
  },
);
