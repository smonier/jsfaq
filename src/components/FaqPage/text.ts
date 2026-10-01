/**
 * Folds a text for matching, one UTF-16 unit for one, so that match positions stay valid in the
 * original text: lower case, without diacritics ("Été" matches "ete"). Only combining marks are
 * removed; a character whose decomposition is made of letters (Hangul syllables) stays whole.
 */
export const fold = (value: string): string => {
  let out = "";
  for (const c of value) {
    const lower = c.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
    if (lower.length === c.length) {
      out += lower;
    } else {
      const same = c.toLowerCase();
      out += same.length === c.length ? same : c;
    }
  }
  return out;
};

/** Tags of an item, from its `data-faq-tags` JSON array; [] when it is absent or not an array. */
export const parseTags = (value: string | null | undefined): string[] => {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((tag): tag is string => typeof tag === "string")
      : [];
  } catch {
    return [];
  }
};

/** Id targeted by a location hash ("#q-1" gives "q-1"), percent-decoded when it is valid. */
export const hashTarget = (hash: string): string => {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};
