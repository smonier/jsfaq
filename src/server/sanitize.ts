/**
 * Allow-list filter for rich text written by editors (FAQ intro, section descriptions, answers).
 *
 * The module never relies on platform-side HTML filtering, because that is a site setting the
 * module cannot count on. The filter runs on the server (GraalJS has no DOM), in one pass over the
 * input, and rebuilds every tag it keeps from the parsed parts. Text is always re-encoded.
 *
 * Kept: editorial markup (paragraphs, lists including definition lists, emphasis, headings, links,
 * images, figures, data tables with their header associations, quotes, code), and the `lang` and
 * `dir` of any element (a phrase in another language, RGAA 8.7).
 * Dropped: comments, scripts, styles, frames, forms and embedded objects with their content; event
 * handlers, inline styles and classes (the module and the site theme own the look); link targets
 * and titles (a new window must be announced, RGAA 13.2); image titles.
 * Link and image URLs keep only http(s), mailto, tel, relative paths, anchors and the Jahia link
 * placeholders (##cms-context##, ##doc-context##), which the render chain rewrites after the view.
 *
 * Ids written by editors are prefixed per block, with the anchors and table `headers` that point
 * at them, so they never collide with the ids of the page.
 *
 * Headings are renumbered from `headingLevel` down: the highest level the editor used becomes
 * `headingLevel`, and a heading is never more than one level below the previous one (RGAA 9.1).
 */

const TEXT_ATTRS = ["lang", "dir"];

const ALLOWED: Record<string, string[]> = Object.fromEntries(
  Object.entries({
    p: [],
    br: [],
    hr: [],
    wbr: [],
    div: [],
    span: [],
    strong: [],
    b: [],
    em: [],
    i: [],
    u: [],
    s: [],
    sub: [],
    sup: [],
    small: [],
    mark: [],
    h1: ["id"],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
    h5: ["id"],
    h6: ["id"],
    ul: [],
    ol: ["start", "reversed"],
    li: [],
    dl: [],
    dt: [],
    dd: [],
    blockquote: ["cite"],
    q: ["cite"],
    cite: [],
    abbr: ["title"],
    a: ["href", "hreflang"],
    img: ["src", "alt", "width", "height"],
    figure: [],
    figcaption: [],
    table: ["role"],
    caption: [],
    thead: [],
    tbody: [],
    tfoot: [],
    tr: [],
    th: ["scope", "colspan", "rowspan", "id", "headers"],
    td: ["colspan", "rowspan", "headers"],
    code: [],
    pre: [],
    kbd: [],
  }).map(([tag, attrs]) => [tag, [...attrs, ...TEXT_ATTRS]]),
);

const VOID = new Set(["br", "hr", "wbr", "img"]);

/** Elements removed together with everything up to their closing tag. */
const DROP_WITH_CONTENT = new Set([
  "script",
  "style",
  "iframe",
  "frame",
  "frameset",
  "object",
  "embed",
  "noscript",
  "noembed",
  "noframes",
  "template",
  "title",
  "textarea",
  "select",
  "xmp",
  "svg",
  "math",
  "head",
]);

const SAFE_URL = /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#|\.{1,2}\/|##(?:cms|doc)-context##)/i;
const SAFE_RELATIVE = /^[\w\-./?=&%~+#]+$/; // "page.html", "files/x.pdf": no scheme, no "//host"
const LANG = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i; // BCP 47, loosely: "en", "fr-CA", "zh-Hant"
const ID = /^[a-z][\w-]{0,63}$/i;
const PREFIX = /^[a-z][\w-]{0,40}$/i;
const NUMBER = /^\d{1,4}$/;
const SCOPE = new Set(["row", "col", "rowgroup", "colgroup"]);
const CHAR_REF = /&(?:#x[0-9a-f]{1,6}|#\d{1,7}|[a-z][a-z0-9]{1,31});/iy;

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  colon: ":",
  tab: "\t",
  newline: "\n",
  sol: "/",
  lpar: "(",
  rpar: ")",
  period: ".",
  comma: ",",
  semi: ";",
  equals: "=",
  num: "#",
  hellip: "\u2026",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201d",
  ldquo: "\u201c",
  laquo: "\u00ab",
  raquo: "\u00bb",
  euro: "\u20ac",
  copy: "\u00a9",
  reg: "\u00ae",
  eacute: "\u00e9",
  egrave: "\u00e8",
  ecirc: "\u00ea",
  agrave: "\u00e0",
  acirc: "\u00e2",
  ccedil: "\u00e7",
  icirc: "\u00ee",
  ocirc: "\u00f4",
  ucirc: "\u00fb",
  ugrave: "\u00f9",
  Eacute: "\u00c9",
};

/** Decodes the character references of an attribute value, as the browser would. */
export const decodeEntities = (value: string): string =>
  value.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z][a-z0-9]{1,31});?/gi, (match, ref: string) => {
    if (ref[0] === "#") {
      const code = ref[1] === "x" || ref[1] === "X" ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "�";
    }
    return NAMED[ref] ?? NAMED[ref.toLowerCase()] ?? match;
  });

const escapeAttr = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Re-encodes a text run: `<` and `>` always, `&` unless it starts a character reference. */
const escapeText = (text: string): string => {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "<") out += "&lt;";
    else if (c === ">") out += "&gt;";
    else if (c === "&") {
      CHAR_REF.lastIndex = i;
      out += CHAR_REF.test(text) ? "&" : "&amp;";
    } else out += c;
  }
  return out;
};

/** True when a link or image URL is allowed (see the module comment). */
export const isSafeUrl = (value: string): boolean => {
  const url = value.trim();
  return SAFE_URL.test(url) || (SAFE_RELATIVE.test(url) && !url.startsWith("//"));
};

const isSpace = (c: string) => c === " " || c === "\n" || c === "\t" || c === "\r" || c === "\f";

type ParsedTag = { attrs: Array<[string, string]>; end: number; closed: boolean };

/** Reads the attributes of a tag from `start` up to its `>`. */
const parseAttributes = (html: string, start: number): ParsedTag => {
  const attrs: Array<[string, string]> = [];
  const seen = new Set<string>();
  const n = html.length;
  let j = start;
  while (j < n) {
    while (j < n && (isSpace(html[j]) || html[j] === "/")) j++;
    if (j >= n) break;
    if (html[j] === ">") return { attrs, end: j + 1, closed: true };
    const nameStart = j;
    if (html[j] === "=") j++;
    while (j < n && !isSpace(html[j]) && html[j] !== "/" && html[j] !== ">" && html[j] !== "=") j++;
    const name = html.slice(nameStart, j).toLowerCase();
    while (j < n && isSpace(html[j])) j++;
    let value = "";
    if (html[j] === "=") {
      j++;
      while (j < n && isSpace(html[j])) j++;
      const quote = html[j];
      if (quote === '"' || quote === "'") {
        const close = html.indexOf(quote, j + 1);
        if (close === -1) return { attrs, end: n, closed: false };
        value = html.slice(j + 1, close);
        j = close + 1;
      } else {
        const valueStart = j;
        while (j < n && !isSpace(html[j]) && html[j] !== ">") j++;
        value = html.slice(valueStart, j);
      }
    }
    if (name && !seen.has(name)) {
      seen.add(name);
      attrs.push([name, decodeEntities(value)]);
    }
  }
  return { attrs, end: n, closed: false };
};

/** Index just after the closing tag of a raw-text element, or the end of the input. */
const skipContent = (lower: string, name: string, from: number): number => {
  let at = from;
  for (;;) {
    const close = lower.indexOf(`</${name}`, at);
    if (close === -1) return lower.length;
    const after = lower[close + name.length + 2];
    if (after === undefined || after === ">" || after === "/" || isSpace(after)) {
      const end = lower.indexOf(">", close);
      return end === -1 ? lower.length : end + 1;
    }
    at = close + name.length + 2;
  }
};

const filterAttributes = (tag: string, attrs: Array<[string, string]>, prefix: string): string => {
  const allowed = ALLOWED[tag];
  const prefixed = (id: string) => (ID.test(id) ? `${prefix}${id}` : undefined);
  let out = "";
  const write = (name: string, value: string) => {
    out += ` ${name}="${escapeAttr(value)}"`;
  };
  for (const [name, raw] of attrs) {
    if (!allowed.includes(name)) continue;
    const value = raw.trim();
    switch (name) {
      case "href":
      case "src":
      case "cite": {
        if (!isSafeUrl(value)) break; // an empty href would still link to this page
        const anchor = name === "href" && value.startsWith("#") ? prefixed(value.slice(1)) : undefined;
        write(name, anchor ? `#${anchor}` : value);
        break;
      }
      case "alt":
      case "title":
        write(name, raw);
        break;
      case "lang":
      case "hreflang":
        if (LANG.test(value)) write(name, value);
        break;
      case "dir":
        if (value === "ltr" || value === "rtl" || value === "auto") write(name, value);
        break;
      case "id": {
        const id = prefixed(value);
        if (id) write("id", id);
        break;
      }
      case "headers": {
        const ids = value.split(/\s+/).map(prefixed).filter(Boolean);
        if (ids.length) write("headers", ids.join(" "));
        break;
      }
      case "role":
        if (value === "presentation") write("role", value);
        break;
      case "scope":
        if (SCOPE.has(value)) write("scope", value);
        break;
      case "reversed":
        write("reversed", "reversed");
        break;
      default: // start, width, height, colspan, rowspan
        if (NUMBER.test(value)) write(name, value);
    }
  }
  return out;
};

const clamp = (level: number) => Math.min(Math.max(level, 2), 6);

/**
 * Renumbers the headings of filtered HTML (see the module comment). Runs on the filter's own
 * output, where every heading tag is canonical, so the tag pattern is simple and linear.
 */
const renumberHeadings = (html: string, base: number): string => {
  const used = [...new Set([...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1])))].sort();
  if (used.length === 0) return html;
  const rank = new Map(used.map((level, index) => [level, clamp(base + index)]));
  let previous = clamp(base) - 1;
  let open = clamp(base);
  return html.replace(/<(\/?)h([1-6])([\s>])/g, (_match, closing: string, level: string, next: string) => {
    if (closing) return `</h${open}${next}`;
    open = Math.min(rank.get(Number(level)) ?? clamp(base), previous + 1);
    previous = open;
    return `<h${open}${next}`;
  });
};

export interface SanitizeOptions {
  /** Level of the first-rank headings of the text: one below the heading that introduces it. */
  headingLevel?: number;
  /** Prefix of the editor's ids and of the anchors that point at them, unique per block. */
  idPrefix?: string;
}

/** Filtered HTML of an editor's rich text (see the module comment). */
export const sanitizeRichText = (
  input: unknown,
  { headingLevel = 3, idPrefix = "jsfaq-rt-" }: SanitizeOptions = {},
): string => {
  const html = typeof input === "string" ? input : input == null ? "" : String(input);
  if (!html) return "";
  const prefix = PREFIX.test(idPrefix) ? idPrefix : "jsfaq-rt-";
  const lower = html.toLowerCase();
  const n = html.length;
  const stack: string[] = [];
  let out = "";
  let i = 0;

  while (i < n) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      out += escapeText(html.slice(i));
      break;
    }
    out += escapeText(html.slice(i, lt));
    i = lt;

    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      i = end === -1 ? n : end + 3;
      continue;
    }
    const next = html[i + 1] ?? "";
    if (next === "!" || next === "?") {
      const end = html.indexOf(">", i + 2);
      i = end === -1 ? n : end + 1;
      continue;
    }
    const closing = next === "/";
    const nameStart = closing ? i + 2 : i + 1;
    if (!/[a-z]/i.test(html[nameStart] ?? "")) {
      if (closing) {
        const end = html.indexOf(">", nameStart);
        i = end === -1 ? n : end + 1;
      } else {
        out += "&lt;";
        i += 1;
      }
      continue;
    }
    let j = nameStart;
    while (j < n && !isSpace(html[j]) && html[j] !== "/" && html[j] !== ">") j++;
    const name = lower.slice(nameStart, j);
    const tag = parseAttributes(html, j);
    i = tag.end;
    if (!tag.closed) break; // a tag cut by the end of the input is dropped, as the browser does

    if (closing) {
      const at = stack.lastIndexOf(name);
      if (at === -1) continue;
      while (stack.length > at) out += `</${stack.pop()}>`;
      continue;
    }
    if (name === "plaintext") break;
    if (DROP_WITH_CONTENT.has(name)) {
      i = skipContent(lower, name, i);
      continue;
    }
    if (!Object.hasOwn(ALLOWED, name)) continue;

    let attrs = filterAttributes(name, tag.attrs, prefix);
    if (name === "img" && !attrs.includes(' alt="')) attrs += ' alt=""'; // a missing alt fails RGAA 1.1
    out += `<${name}${attrs}>`;
    if (!VOID.has(name)) stack.push(name);
  }
  while (stack.length) out += `</${stack.pop()}>`;

  return renumberHeadings(out, headingLevel);
};

const BLOCK_BOUNDARY = /<\/?(?:p|div|br|li|h[1-6]|tr|td|th|dt|dd|blockquote|figcaption|pre|hr)\b[^>]*>/gi;

/** Plain text of an editor's rich text, for structured data and search. */
export const htmlToPlainText = (input: unknown): string => {
  const clean = sanitizeRichText(input);
  if (!clean) return "";
  return decodeEntities(clean.replace(BLOCK_BOUNDARY, " ").replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
};
