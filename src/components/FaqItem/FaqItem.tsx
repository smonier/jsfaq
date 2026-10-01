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
   * True outside edit mode: the item is a native disclosure (`<details>`), closed until the
   * visitor opens it, with or without JavaScript. In edit mode the answer is always shown.
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
  const heading = (
    <Heading className={classes["jsfaq-item__heading"]}>
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
      {interactive ? <Chevron /> : null}
    </Heading>
  );
  const body = (
    <div className={classes["jsfaq-item__answer"]} data-faq-answer>
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
  );
  const data = {
    "id": `q-${uuid}`,
    "data-faq-item": "true",
    "data-faq-id": uuid,
    "data-faq-tags": tags.length ? JSON.stringify(tags) : undefined,
    "data-faq-featured": isFeatured ? "true" : undefined,
  };

  if (!interactive) {
    return (
      <div className={classes["jsfaq-item"]} {...data}>
        <div className={classes["jsfaq-item__label"]}>{heading}</div>
        {body}
      </div>
    );
  }
  return (
    <details className={classes["jsfaq-item"]} {...data}>
      <summary className={classes["jsfaq-item__toggle"]} data-faq-toggle>
        {heading}
      </summary>
      {body}
    </details>
  );
};

export default FaqItem;
