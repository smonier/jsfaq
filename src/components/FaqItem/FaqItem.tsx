import type { ReactNode } from "react";
import FeaturedBadge from "../FaqPage/FeaturedBadge";
import classes from "../../styles/faq.module.css";

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

type FaqItemProps = {
  uuid: string;
  question: string;
  answer: ReactNode;
  tags: string[];
  isFeatured: boolean;
  /** Level of the question heading. */
  level: number;
  /**
   * True when the FAQ script drives the item: the question is a disclosure button. The answer is
   * rendered open, so that it stays readable without JavaScript; the script closes it.
   */
  interactive: boolean;
  strings: { featured: string; itemTags: string };
};

const Chevron = () => (
  <svg
    className={classes["jsfaq-item__icon"]}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FaqItem = ({
  uuid,
  question,
  answer,
  tags,
  isFeatured,
  level,
  interactive,
  strings,
}: FaqItemProps) => {
  const Heading = `h${Math.min(Math.max(level, 2), 6)}` as HeadingTag;
  const answerId = `answer-${uuid}`;
  const label = (
    <>
      <span className={classes["jsfaq-item__question"]} data-faq-question>
        {question}
      </span>
      {/* The space keeps the badge a separate word in the accessible name. */}
      {isFeatured ? (
        <>
          {" "}
          <FeaturedBadge label={strings.featured} />
        </>
      ) : null}
    </>
  );

  return (
    <article
      className={classes["jsfaq-item"]}
      id={`q-${uuid}`}
      tabIndex={-1}
      data-faq-item={interactive ? "true" : undefined}
      data-faq-id={uuid}
      data-faq-tags={tags.length ? JSON.stringify(tags) : undefined}
      data-faq-featured={isFeatured ? "true" : undefined}
    >
      <Heading className={classes["jsfaq-item__heading"]}>
        {interactive ? (
          <button
            type="button"
            className={classes["jsfaq-item__toggle"]}
            id={`toggle-${uuid}`}
            aria-expanded="true"
            aria-controls={answerId}
            data-faq-toggle
          >
            {label}
            <Chevron />
          </button>
        ) : (
          <span className={classes["jsfaq-item__label"]}>{label}</span>
        )}
      </Heading>
      <div className={classes["jsfaq-item__answer"]} id={answerId} data-faq-answer>
        {answer}
        {tags.length ? (
          <ul className={classes["jsfaq-item__tags"]} aria-label={strings.itemTags}>
            {tags.map((tag) => (
              <li key={tag} className={classes["jsfaq-item__tag"]}>
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
