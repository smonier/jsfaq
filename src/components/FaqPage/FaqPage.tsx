import type { FaqItem as FaqItemType, FaqSection as FaqSectionType, FaqStrings } from "../../types";
import FaqSearch from "./FaqSearch";
import FaqTags from "./FaqTags";
import EmptyState from "./EmptyState";
import FaqSection from "../FaqSection/FaqSection";
import FaqItem from "../FaqItem/FaqItem";
import classes from "../../styles/faq.module.css";

type FaqPageProps = {
  title: string;
  introHtml?: string;
  sections: FaqSectionType[];
  items: FaqItemType[];
  tags: string[];
  searchTerm: string;
  activeTags: string[];
  featuredFirst: boolean;
  openItemIds: Set<string>;
  interactive?: boolean;
  strings: FaqStrings;
  onSearchChange?: (value: string) => void;
  onClearFilters?: () => void;
  onFeaturedFirstChange?: (value: boolean) => void;
  onTagToggle?: (tag: string) => void;
  onToggleItem?: (uuid: string) => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
};

const FaqPage = ({
  title,
  introHtml,
  sections,
  items,
  tags,
  searchTerm,
  activeTags,
  featuredFirst,
  openItemIds,
  interactive,
  strings,
  onSearchChange,
  onClearFilters,
  onFeaturedFirstChange,
  onTagToggle,
  onToggleItem,
  onExpandAll,
  onCollapseAll,
}: FaqPageProps) => {
  const hasActiveFilters = Boolean(searchTerm || activeTags.length || featuredFirst);

  return (
    <article className={classes.jsfaq} data-faq-root>
      <header className={classes.jsfaq__header}>
        <h1 className={classes.jsfaq__title}>{title}</h1>
        {introHtml ? (
          <div className={classes.jsfaq__intro} dangerouslySetInnerHTML={{ __html: introHtml }} />
        ) : null}
      </header>

      <section className={classes.jsfaq__controls} data-island="FaqSearch">
        <FaqSearch
          searchTerm={searchTerm}
          featuredFirst={featuredFirst}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={onSearchChange}
          onClearFilters={onClearFilters}
          onFeaturedFirstChange={onFeaturedFirstChange}
          onExpandAll={onExpandAll}
          onCollapseAll={onCollapseAll}
          strings={{
            searchPlaceholder: strings.searchPlaceholder,
            clearFilters: strings.clearFilters,
            featuredFirst: strings.featuredFirst,
            expandAll: strings.expandAll,
            collapseAll: strings.collapseAll,
          }}
        />
        <FaqTags
          tags={tags}
          activeTags={activeTags}
          onTagToggle={onTagToggle}
          strings={{ tagsLabel: strings.tagsLabel }}
        />
      </section>

      <div className={classes.jsfaq__content} data-island="FaqList">
        {sections.map((section) => (
          <FaqSection
            key={section.uuid}
            section={section}
            items={section.items}
            openItemIds={openItemIds}
            interactive={interactive}
            strings={{
              featured: strings.featured,
              tagsLabel: strings.tagsLabel,
            }}
            onToggleItem={onToggleItem}
          />
        ))}

        {items.length ? (
          <section
            className={`${classes["jsfaq-section"]} ${classes["jsfaq-section--standalone"]}`}
            data-faq-section
            data-faq-section-id="standalone"
          >
            <header className={classes["jsfaq-section__header"]}>
              <h2
                className={`${classes["jsfaq-section__title"]} ${classes["jsfaq-visually-hidden"]}`}
              >
                {strings.questionsHeading}
              </h2>
            </header>
            <div className={classes["jsfaq-section__items"]} data-faq-section-items>
              {items.map((item) => (
                <FaqItem
                  key={item.uuid}
                  item={item}
                  isOpen={openItemIds.has(item.uuid)}
                  interactive={interactive}
                  strings={{
                    featured: strings.featured,
                    tagsLabel: strings.tagsLabel,
                  }}
                  onToggle={onToggleItem}
                />
              ))}
            </div>
          </section>
        ) : null}

        <EmptyState message={strings.noResults} />
      </div>
    </article>
  );
};

export default FaqPage;
