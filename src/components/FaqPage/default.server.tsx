import {
  AddResources,
  Island,
  buildModuleFileUrl,
  jahiaComponent,
  RenderChildren,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import FaqPageClient from "./FaqPage.client";
import classes from "../../styles/faq.module.css";
import RichText from "../../server/RichText";
import { buildFaqJsonLdObject, jsonForScript, type FaqEntry } from "../../server/schemaOrg";
import {
  ITEM_TYPE,
  SECTION_TYPE,
  getChildNodes,
  getPageContentLevel,
  getPageLevel,
  getString,
  getTags,
  idPrefixFor,
  isType,
} from "../../server/nodes";

type HeadingTag = "h2" | "h3" | "h4";

/** The questions of the FAQ, in the order they are shown (direct items and section items). */
const collectItems = (page: JCRNodeWrapper): JCRNodeWrapper[] =>
  getChildNodes(page).flatMap((child) => {
    if (isType(child, ITEM_TYPE)) return [child];
    if (isType(child, SECTION_TYPE))
      return getChildNodes(child).filter((node) => isType(node, ITEM_TYPE));
    return [];
  });

const CheckIcon = () => (
  <svg
    className={classes["jsfaq-tag__check"]}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M2 6.5L5 9.5L10 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className={classes["jsfaq__search-icon"]}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M17.5 17.5l-3.625-3.625m1.875-4.375a6.25 6.25 0 11-12.5 0 6.25 6.25 0 0112.5 0z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

jahiaComponent(
  {
    nodeType: "jsfaqnt:faqPage",
    componentType: "view",
    displayName: "FAQ Page",
  },
  (_props, { currentNode, renderContext }) => {
    const { t } = useTranslation();
    const uuid = String(currentNode.getIdentifier());
    const rootId = `jsfaq-${uuid}`;
    const title = getString(currentNode, "jcr:title");
    const level = getPageLevel(currentNode);
    const contentLevel = getPageContentLevel(currentNode);
    const Heading = `h${level}` as HeadingTag;
    // The controls only work with the FAQ script, which edit mode does not run: there, every
    // answer is shown so that editors can reach it.
    const interactive = !renderContext.isEditMode();
    const enableTagFilter = (() => {
      try {
        return (
          !currentNode.hasProperty("enableTagFilter") ||
          currentNode.getProperty("enableTagFilter").getBoolean()
        );
      } catch {
        return false;
      }
    })();

    const items = collectItems(currentNode);
    const tags = enableTagFilter
      ? [...new Set(items.flatMap((item) => getTags(item)))].sort((a, b) => a.localeCompare(b))
      : [];
    const entries: FaqEntry[] = items.map((item) => ({
      uuid: String(item.getIdentifier()),
      question: getString(item, "question") || getString(item, "jcr:title"),
      answerHtml: getString(item, "answer"),
    }));
    const jsonLd = buildFaqJsonLdObject(entries);

    const cssResource = (() => {
      try {
        return buildModuleFileUrl("dist/assets/style.css");
      } catch {
        return "/modules/jsfaq/dist/assets/style.css";
      }
    })();

    const intro = (
      <RichText
        className={classes.jsfaq__intro}
        html={getString(currentNode, "intro")}
        headingLevel={contentLevel}
        idPrefix={idPrefixFor(currentNode, "i")}
      />
    );

    return (
      <section className={classes["jsfaq-ssr-wrapper"]}>
        <AddResources type="css" resources={cssResource} />

        <div
          className={classes.jsfaq}
          id={rootId}
          data-faq-root
          data-faq-open-class={classes["jsfaq-item--open"]}
          data-faq-tag-active-class={classes["jsfaq-tag--active"]}
          data-faq-highlight-class={classes["jsfaq-highlight"]}
        >
          {title ? (
            <header className={classes.jsfaq__header}>
              <Heading className={classes.jsfaq__title}>{title}</Heading>
              {intro}
            </header>
          ) : (
            intro
          )}

          {interactive && entries.length > 0 ? (
            // Hidden until the FAQ script runs: without it, these controls would do nothing.
            <div className={classes.jsfaq__controls} data-faq-controls hidden>
              <div className={classes.jsfaq__search}>
                <label className={classes["jsfaq__search-label"]} htmlFor={`${rootId}-search`}>
                  {t("searchLabel")}
                </label>
                <div className={classes["jsfaq__search-field"]}>
                  <SearchIcon />
                  <input
                    type="search"
                    id={`${rootId}-search`}
                    className={classes["jsfaq__search-input"]}
                    autoComplete="off"
                    spellCheck={false}
                    data-faq-search
                  />
                </div>
              </div>

              {tags.length > 0 ? (
                <div
                  className={classes["jsfaq-tags"]}
                  role="group"
                  aria-labelledby={`${rootId}-tags`}
                >
                  <span className={classes["jsfaq-tags__label"]} id={`${rootId}-tags`}>
                    {t("tagsLabel")}
                  </span>
                  <ul className={classes["jsfaq-tags__list"]}>
                    {tags.map((tag) => (
                      <li key={tag}>
                        <button
                          type="button"
                          className={classes["jsfaq-tag"]}
                          data-faq-tag={tag}
                          aria-pressed="false"
                        >
                          <CheckIcon />
                          {tag}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className={classes.jsfaq__toolbar}>
                <p className={classes.jsfaq__status} role="status" data-faq-status />
                <div className={classes["jsfaq__toolbar-actions"]}>
                  <button type="button" className={classes["jsfaq-button"]} data-faq-expand-all>
                    {t("expandAll")}
                  </button>
                  <button type="button" className={classes["jsfaq-button"]} data-faq-collapse-all>
                    {t("collapseAll")}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className={classes.jsfaq__content}>
            <RenderChildren />
          </div>
        </div>

        {jsonLd.mainEntity.length > 0 ? (
          <script type="application/ld+json">{jsonForScript(jsonLd)}</script>
        ) : null}

        {interactive ? <Island component={FaqPageClient} props={{ rootId }} /> : null}
      </section>
    );
  },
);
