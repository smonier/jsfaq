import { describe, expect, it } from "vitest";
import { fold, hashTarget, parseTags } from "./text";

describe("fold", () => {
  it("removes diacritics and case, one unit for one", () => {
    expect(fold("Été à Noël")).toBe("ete a noel");
    expect(fold("Ça")).toBe("ca");
    expect(fold("İstanbul")).toBe("istanbul");
    for (const text of ["Été", "İİ", "한국어", "がぎ", "a😀b", "ﬁ"]) {
      expect(fold(text)).toHaveLength(text.length);
    }
  });

  it("keeps characters whose decomposition is made of letters", () => {
    expect(fold("한국")).toBe("한국");
    expect(fold("하고").includes(fold("한국"))).toBe(false);
    expect(fold("한국어").includes(fold("한국"))).toBe(true);
  });

  it("removes the voicing marks of kana, which are combining marks", () => {
    expect(fold("が")).toBe("か");
  });
});

describe("parseTags", () => {
  it("reads a JSON array of strings", () => {
    expect(parseTags('["a","b",1]')).toEqual(["a", "b"]);
  });

  it("returns [] for anything else", () => {
    expect(parseTags(undefined)).toEqual([]);
    expect(parseTags("")).toEqual([]);
    expect(parseTags("{")).toEqual([]);
    expect(parseTags('{"a":1}')).toEqual([]);
  });
});

describe("hashTarget", () => {
  it("returns the id of the hash, decoded", () => {
    expect(hashTarget("#q-123")).toBe("q-123");
    expect(hashTarget("#q-%C3%A9")).toBe("q-é");
    expect(hashTarget("")).toBe("");
  });

  it("keeps a malformed escape as written", () => {
    expect(hashTarget("#q-%E0%A4%A")).toBe("q-%E0%A4%A");
  });
});
