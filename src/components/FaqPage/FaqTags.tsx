import classes from "../../styles/faq.module.css";

type FaqTagsProps = {
  tags: string[];
  activeTags: string[];
  onTagToggle?: (tag: string) => void;
  strings: {
    tagsLabel: string;
  };
};

const FaqTags = ({ tags, activeTags, onTagToggle, strings }: FaqTagsProps) => {
  if (!tags.length) return null;

  return (
    <div
      className={classes["jsfaq-tags"]}
      role="group"
      aria-label={strings.tagsLabel}
      data-faq-tags
    >
      {tags.map((tag) => {
        const isActive = activeTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            className={
              isActive
                ? `${classes["jsfaq-tag"]} ${classes["jsfaq-tag--active"]}`
                : classes["jsfaq-tag"]
            }
            data-faq-tag={tag}
            aria-pressed={isActive}
            onClick={onTagToggle ? () => onTagToggle(tag) : undefined}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};

export default FaqTags;
