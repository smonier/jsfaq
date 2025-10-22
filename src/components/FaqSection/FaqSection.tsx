import FaqItem from "../FaqItem/FaqItem";
import type { FaqItem as FaqItemType, FaqSection as FaqSectionType, FaqStrings } from "../../types";
import classes from "../../styles/faq.module.css";

type FaqSectionProps = {
  section: FaqSectionType;
  items: FaqItemType[];
  openItemIds: Set<string>;
  interactive?: boolean;
  strings: Pick<FaqStrings, "featured" | "tagsLabel">;
  onToggleItem?: (uuid: string) => void;
};

const FaqSection = ({
  section,
  items,
  openItemIds,
  interactive,
  strings,
  onToggleItem,
}: FaqSectionProps) => {
  if (!items.length) return null;
  const headingId = `section-${section.uuid}`;

  return (
    <section
      className={classes["jsfaq-section"]}
      data-faq-section
      data-faq-section-id={section.uuid}
    >
      <header className={classes["jsfaq-section__header"]}>
        <h2 id={headingId} className={classes["jsfaq-section__title"]}>
          {section.sectionTitle}
        </h2>
        {section.sectionDescription ? (
          <div
            className={classes["jsfaq-section__description"]}
            dangerouslySetInnerHTML={{ __html: section.sectionDescription }}
          />
        ) : null}
      </header>
      <div className={classes["jsfaq-section__items"]} data-faq-section-items>
        {items.map((item) => (
          <FaqItem
            key={item.uuid}
            item={item}
            isOpen={openItemIds.has(item.uuid)}
            interactive={interactive}
            strings={strings}
            onToggle={onToggleItem}
          />
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
