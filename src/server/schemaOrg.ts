import { htmlToPlainText } from "./sanitize";
import type { SchemaOrgFaq } from "../types";

export type FaqEntry = { uuid: string; question: string; answerHtml: string };

/** schema.org FAQPage of the questions shown, each once, with a plain-text answer. */
export const buildFaqJsonLdObject = (entries: FaqEntry[]): SchemaOrgFaq => {
  const seen = new Set<string>();
  const mainEntity: SchemaOrgFaq["mainEntity"] = [];
  for (const entry of entries) {
    if (!entry.uuid || seen.has(entry.uuid)) continue;
    seen.add(entry.uuid);
    const text = htmlToPlainText(entry.answerHtml);
    const name = entry.question.trim();
    if (!name || !text) continue;
    mainEntity.push({ "@type": "Question", name, "acceptedAnswer": { "@type": "Answer", text } });
  }
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity };
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
