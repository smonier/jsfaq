import { sanitizeRichText } from "./sanitize";

/**
 * Renders a rich-text property written by an editor (FAQ intro, section description, answer).
 *
 * This is the only raw-HTML sink of the module, on purpose: every view renders rich text through
 * it, and the HTML is passed through the allow-list filter of `sanitize.ts` right here. The module
 * never relies on platform-side HTML filtering, a site setting it cannot count on.
 *
 * `headingLevel` is the level the text's own headings start at: one below the heading that
 * introduces the text, so the page outline never skips a level. `idPrefix` keeps the editor's ids
 * unique on the page.
 */
const RichText = ({
  html,
  className,
  headingLevel,
  idPrefix,
}: {
  html?: unknown;
  className?: string;
  headingLevel: number;
  idPrefix: string;
}) => {
  const clean = sanitizeRichText(html, { headingLevel, idPrefix });
  if (!clean) return null;
  return (
    <div
      className={className}
      // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml -- filtered just above, see the component comment
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default RichText;
