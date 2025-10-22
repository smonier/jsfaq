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

export const buildFaqJsonLd = (page: FaqPage): string => {
  const jsonLd = buildFaqJsonLdObject(page);
  return JSON.stringify(jsonLd);
};

export default buildFaqJsonLd;
