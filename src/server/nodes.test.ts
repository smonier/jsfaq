import { describe, expect, it } from "vitest";
import { escapeRegExp, subtreePattern } from "./nodes";

describe("subtreePattern", () => {
  it("matches the node and its descendants only", () => {
    const pattern = new RegExp(subtreePattern("/sites/a.b/home/faq(1)"));
    expect(pattern.test("/sites/a.b/home/faq(1)")).toBe(true);
    expect(pattern.test("/sites/a.b/home/faq(1)/section/item")).toBe(true);
    expect(pattern.test("/sites/a.b/home/faq(1)2")).toBe(false);
    expect(pattern.test("/sites/aXb/home/faq(1)")).toBe(false);
  });

  it("escapes every pattern character", () => {
    expect(escapeRegExp("a.b*c+d?e^f$g{h}i(j)k|l[m]n\\o")).toBe(
      "a\\.b\\*c\\+d\\?e\\^f\\$g\\{h\\}i\\(j\\)k\\|l\\[m\\]n\\\\o",
    );
  });
});
