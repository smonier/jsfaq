import type { FaqItem as FaqItemType, FaqStrings } from "../../types";
import FeaturedBadge from "../FaqPage/FeaturedBadge";
import classes from "../../styles/faq.module.css";

type FaqItemProps = {
  item: FaqItemType;
  isOpen: boolean;
  interactive?: boolean;
  strings: Pick<FaqStrings, "featured" | "tagsLabel">;
  onToggle?: (uuid: string) => void;
};

const FaqItem = ({ item, isOpen, strings, onToggle }: FaqItemProps) => {
  const questionId = `q-${item.uuid}`;
  const answerId = `answer-${item.uuid}`;

  const handleToggle = () => {
    if (onToggle) onToggle(item.uuid);
  };

  return (
    <article
      className={
        isOpen ? `${classes["jsfaq-item"]} ${classes["jsfaq-item--open"]}` : classes["jsfaq-item"]
      }
      data-faq-item="true"
      data-faq-id={item.uuid}
      data-faq-tags={(item.tags ?? []).join("|")}
      data-faq-featured={item.isFeatured ? "true" : "false"}
      data-faq-question={item.question}
      id={questionId}
      tabIndex={-1}
    >
      <header className={classes["jsfaq-item__header"]}>
        <button
          type="button"
          className={classes["jsfaq-item__toggle"]}
          aria-expanded={isOpen}
          aria-controls={answerId}
          data-faq-toggle
          onClick={onToggle ? handleToggle : undefined}
        >
          <span className={classes["jsfaq-item__question"]}>{item.question}</span>
          {item.isFeatured ? <FeaturedBadge label={strings.featured} /> : null}
          <svg
            className={classes["jsfaq-item__icon"]}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>
      <div
        className={classes["jsfaq-item__answer"]}
        id={answerId}
        role="region"
        aria-labelledby={questionId}
        data-faq-answer
      >
        <div
          className={classes["jsfaq-item__answer-content"]}
          dangerouslySetInnerHTML={{ __html: item.answerHtml }}
        />
        {item.tags?.length ? (
          <ul className={classes["jsfaq-item__tags"]} aria-label={strings.tagsLabel}>
            {item.tags.map((tag) => (
              <li key={`${item.uuid}-${tag}`} className={classes["jsfaq-item__tag"]}>
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
};

export default FaqItem;
