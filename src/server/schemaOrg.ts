import { htmlToPlainText } from "./sanitize";
import type { FaqItem, FaqPage, SchemaOrgFaq } from "../types";

const uniqueByUuid = (items: FaqItem[]): FaqItem[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item.uuid) return false;
    if (seen.has(item.uuid)) return false;
    seen.add(item.uuid);
    return Boolean(item.question && item.answerHtml);
  });
};

export const buildFaqJsonLdObject = (page: FaqPage): SchemaOrgFaq => {
  const flattened = uniqueByUuid([
    ...(page.items ?? []),
    ...page.sections.flatMap((section) => section.items ?? []),
  ]);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: flattened.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: htmlToPlainText(item.answerHtml),
      },
    })),
  };
};

/**
 * JSON for the text of a <script> element. React writes script text as is, so every character
 * that could end the element or start markup is written as a JSON escape. The JSON value is
 * unchanged.
 */
export const jsonForScript = (value: unknown): string =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

export const buildFaqJsonLd = (page: FaqPage): string => jsonForScript(buildFaqJsonLdObject(page));

export default buildFaqJsonLd;
