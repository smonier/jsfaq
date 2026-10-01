import { describe, expect, it } from "vitest";
import { buildFaqJsonLdObject, jsonForScript } from "./schemaOrg";

describe("buildFaqJsonLdObject", () => {
  it("lists each question once, with a plain-text answer", () => {
    const faq = buildFaqJsonLdObject([
      { uuid: "1", question: " Q1 ", answerHtml: "<p>&uuml;ber <b>A</b></p><style>p{}</style>" },
      { uuid: "1", question: "Q1 again", answerHtml: "<p>B</p>" },
      { uuid: "2", question: "Q2", answerHtml: "" },
      { uuid: "", question: "Q3", answerHtml: "<p>C</p>" },
    ]);
    expect(faq.mainEntity).toEqual([
      {
        "@type": "Question",
        "name": "Q1",
        "acceptedAnswer": { "@type": "Answer", "text": "über A" },
      },
    ]);
  });
});

describe("jsonForScript", () => {
  it("writes markup characters as JSON escapes, keeping the value", () => {
    const separators = String.fromCharCode(0x2028, 0x2029);
    const value = { a: `</script><!-- & ${separators}` };
    const json = jsonForScript(value);
    for (const c of ["<", ">", "&", ...separators]) expect(json).not.toContain(c);
    expect(JSON.parse(json)).toEqual(value);
  });
});
