import { useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import classes from "../styles/faq.module.css";
import { sanitizeRichTextWithReport } from "./sanitize";

/**
 * Renders a formatted-text property written by an editor (FAQ intro, section description,
 * answer). Every view renders formatted text through this component, and the text goes through
 * the allow-list of `sanitize.ts` right here, whatever the site's own HTML settings are.
 *
 * `headingLevel` is the level the text's own headings start at: one below the heading that
 * introduces the text, so the page outline never skips a level. `idPrefix` keeps the editor's ids
 * unique on the page. In edit mode, an image without a text alternative is pointed out.
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
  const { t } = useTranslation("jsfaq");
  const { renderContext } = useServerContext();
  const { html: clean, imageWithoutAlt } = sanitizeRichTextWithReport(html, {
    headingLevel,
    idPrefix,
  });
  if (!clean) return null;
  return (
    <>
      <div
        className={className}
        // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml -- allow-list applied just above (sanitize.ts)
        dangerouslySetInnerHTML={{ __html: clean }}
      />
      {imageWithoutAlt && renderContext.isEditMode() ? (
        <p className={classes["jsfaq-edit-hint"]}>{t("imageWithoutAlt")}</p>
      ) : null}
    </>
  );
};

export default RichText;
