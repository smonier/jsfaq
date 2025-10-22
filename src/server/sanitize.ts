const HTML_ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

const ENTITY_REGEX = new RegExp(
  `(${Object.keys(HTML_ENTITY_MAP)
    .map((entity) => entity.replace(/([.*+?^${}()|[\]\\])/g, "\\$1"))
    .join("|")})`,
  "g"
);

const STRIP_TAGS_REGEX = /<\/?[^>]+(>|$)/g;
const WHITESPACE_REGEX = /\s+/g;

/**
 * Transforms inline HTML field content into a plain text string suitable for JSON-LD.
 */
export const htmlToPlainText = (input: string): string => {
  if (!input) return "";
  const withoutTags = input.replace(STRIP_TAGS_REGEX, " ");
  const decoded = withoutTags.replace(ENTITY_REGEX, (match) => HTML_ENTITY_MAP[match] ?? match);
  return decoded.trim().replace(WHITESPACE_REGEX, " ");
};

export default htmlToPlainText;
