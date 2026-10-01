import { describe, expect, it } from "vitest";
import {
  htmlToPlainText,
  isSafeUrl,
  sanitizeRichText,
  sanitizeRichTextWithReport,
} from "./sanitize";

const P = "jsfaq-a-12345678-";

describe("sanitizeRichText - allow-list", () => {
  it("keeps editorial markup", () => {
    const html =
      "<h3>T</h3><p>a <strong>b</strong> <em>c</em></p><ul><li>d</li></ul><blockquote>q</blockquote>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("returns an empty string for empty or absent values", () => {
    expect(sanitizeRichText("")).toBe("");
    expect(sanitizeRichText(undefined)).toBe("");
    expect(sanitizeRichText(null)).toBe("");
  });

  it("leaves out elements outside the allow-list with their content, and attributes", () => {
    const out = sanitizeRichText(
      '<p style="color:red" class="x" onclick="x()">ok</p><script>alert(2)</script><img src="/a.png" onerror="alert(1)">',
    );
    expect(out).toBe('<p>ok</p><img alt="" src="/a.png">');
  });

  it("keeps only the allowed URL schemes", () => {
    for (const href of [
      "javascript:alert(1)",
      "JAVASCRIPT:alert(1)",
      "java\tscript:x",
      "javascript&#58;alert(1)",
      "jav&#x09;ascript:alert(1)",
      "data:text/html,x",
      "vbscript:x",
      "//example.com",
      "&#47;&#47;example.com",
    ]) {
      expect(sanitizeRichText(`<a href="${href}">x</a>`)).toBe("<a>x</a>");
    }
  });

  it("keeps links to paths that resolve on the same host only", () => {
    for (const href of ["/\\example.com/a", "/&#9;/example.com/a", "/\t/example.com", "\\\\x"]) {
      expect(sanitizeRichText(`<a href="${href}">x</a>`)).toBe("<a>x</a>");
    }
  });

  it("keeps http(s), mailto, tel, relative paths and Jahia link placeholders", () => {
    for (const href of [
      "https://jahia.com",
      "http://jahia.com/a?b=1",
      "mailto:a@b.c",
      "tel:+33100000000",
      "/sites/x/home.html",
      "##cms-context##/{mode}/{lang}/sites/x/home.html",
      "##doc-context##/{workspace}/sites/x/files/a.pdf",
      "page.html",
      "files/a.pdf#page=2",
      "../up.html",
      "?q=1",
    ]) {
      expect(sanitizeRichText(`<a href="${href}">x</a>`)).toBe(`<a href="${href}">x</a>`);
    }
  });

  it("writes URLs as the browser reads them", () => {
    // `&num` before "=" stays as written in an attribute; `&amp;` is the same "&" encoded.
    expect(sanitizeRichText('<a href="https://ex.test/s?q=faq&num=10&copy=1">x</a>')).toBe(
      '<a href="https://ex.test/s?q=faq&amp;num=10&amp;copy=1">x</a>',
    );
    expect(sanitizeRichText('<a href="https://ex.test/s?a=1&amp;b=2">x</a>')).toBe(
      '<a href="https://ex.test/s?a=1&amp;b=2">x</a>',
    );
  });

  it("decodes character references in attributes with the full HTML table, case-sensitive", () => {
    expect(sanitizeRichText('<img src="/x.png" alt="&uuml;ber &Agrave; &ntilde; &szlig;">')).toBe(
      '<img src="/x.png" alt="über À ñ ß">',
    );
    expect(sanitizeRichText('<img src="/x.png" alt="a &quot;b&quot; &lt;c&gt;">')).toBe(
      '<img src="/x.png" alt="a &quot;b&quot; &lt;c&gt;">',
    );
  });

  it("opens links in the same window, without title", () => {
    expect(
      sanitizeRichText('<a href="https://x.org" target="_blank" rel="opener" title="t">x</a>'),
    ).toBe('<a href="https://x.org">x</a>');
  });

  it("leaves out image titles", () => {
    expect(sanitizeRichText('<img src="/a.png" alt="" title="t">')).toBe(
      '<img src="/a.png" alt="">',
    );
  });

  it("leaves out frames and forms, and keeps the text of unknown elements", () => {
    expect(
      sanitizeRichText('<iframe src="https://x"></iframe><form><input></form><custom>t</custom>'),
    ).toBe("t");
  });

  it("leaves out void and document-level tags without losing the text after them", () => {
    expect(sanitizeRichText('<p>a</p><embed src="/x.swf"><p>b</p>')).toBe("<p>a</p><p>b</p>");
    expect(sanitizeRichText('<p>a</p><frame src="/x"><p>b</p>')).toBe("<p>a</p><p>b</p>");
    expect(sanitizeRichText("<head><p>a</p></head><p>b</p>")).toBe("<p>a</p><p>b</p>");
    expect(sanitizeRichText("<p>a</p><frameset><p>b</p>")).toBe("<p>a</p><p>b</p>");
  });

  it("closes a self-closing svg or math element right away", () => {
    expect(sanitizeRichText("<p>a<svg/>b</p><p>c</p>")).toBe("<p>ab</p><p>c</p>");
    expect(sanitizeRichText("<p>a<math/>b</p><p>c</p>")).toBe("<p>ab</p><p>c</p>");
    expect(sanitizeRichText("<p>a<svg><svg></svg><text>x</text></svg>b</p>")).toBe("<p>ab</p>");
  });

  it("leaves out an element with its content until its end tag, or the end of the text", () => {
    expect(sanitizeRichText("<p>a</p><style>p{color:red}</style><p>b</p>")).toBe(
      "<p>a</p><p>b</p>",
    );
    expect(sanitizeRichText("<p>a</p><style>p{color:red}")).toBe("<p>a</p>");
  });

  it("keeps tables with their caption", () => {
    const html =
      '<table><caption>c</caption><thead><tr><th scope="col">h</th></tr></thead><tbody><tr><td colspan="2">d</td></tr></tbody></table>';
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("keeps numbers only in numeric attributes", () => {
    expect(sanitizeRichText('<ol start="3" reversed><li>a</li></ol>')).toBe(
      '<ol start="3" reversed=""><li>a</li></ol>',
    );
    expect(sanitizeRichText('<img src="/a.png" alt="" width="10px" height="20">')).toBe(
      '<img src="/a.png" alt="" height="20">',
    );
  });

  it("keeps the first of two attributes with the same name, as the browser does", () => {
    expect(sanitizeRichText('<a href="/a" href="/b">x</a>')).toBe('<a href="/a">x</a>');
  });
});

describe("sanitizeRichText - text and markup boundaries", () => {
  it("keeps text as written, and a '<' that starts no tag as text", () => {
    expect(sanitizeRichText("<p>1 &lt; 2 &amp; R&D</p>")).toBe("<p>1 &lt; 2 &amp; R&D</p>");
    expect(sanitizeRichText("<p>1 < 2 and 3 > 2</p>")).toBe("<p>1 &lt; 2 and 3 &gt; 2</p>");
  });

  it("reads an abruptly closed comment as an empty comment", () => {
    expect(sanitizeRichText("<p>a<!-->b</p><p>c</p><!-- x -->d")).toBe("<p>ab</p><p>c</p>d");
    expect(sanitizeRichText("<p>a<!--->b</p>")).toBe("<p>ab</p>");
  });

  it("keeps the markup around a dotted capital I (a lower case of another length)", () => {
    expect(sanitizeRichText("<p>İstanbul</p><p>b</p>")).toBe("<p>İstanbul</p><p>b</p>");
    expect(sanitizeRichText("İ<style>body{color:red}</style><p>a</p>")).toBe("İ<p>a</p>");
    // "<" before a letter outside a-z is text for the browser too.
    expect(sanitizeRichText("<İ>x</İ><b>y</b><style>i{}</style>z")).toBe("&lt;İ&gt;x<b>y</b>z");
    expect(sanitizeRichText('<p title="İ">a</p><STYLE>b{}</STYLE>c')).toBe("<p>a</p>c");
  });

  it("reads </br> as a line break, as the browser does", () => {
    expect(sanitizeRichText("<p>a</br>b</p>")).toBe("<p>a<br>b</p>");
  });

  it("closes every element inside the block and leaves out closing tags with no element", () => {
    expect(sanitizeRichText("<p><strong>a")).toBe("<p><strong>a</strong></p>");
    expect(sanitizeRichText("</div></section><p>a</p></div>")).toBe("<p>a</p>");
    expect(sanitizeRichText("<ul><li><em>a</li></ul>b")).toBe("<ul><li><em>a</em></li></ul>b");
  });

  it("leaves out a tag cut by the end of the text", () => {
    expect(sanitizeRichText('<p>a</p><a href="/x')).toBe('<p>a</p>&lt;a href="/x');
    expect(sanitizeRichText("<p>a</p><b")).toBe("<p>a</p>");
  });

  it("runs in linear time", () => {
    const inputs = [
      "</p>".repeat(280_000), // 1.12M characters of closing tags with no element
      "<p>".repeat(370_000),
      "<p><b>".repeat(100_000) + "</p>".repeat(100_000),
      `<p ${"a ".repeat(200_000)}>x</p>`,
      `<p ${"a= ".repeat(100_000)}>x</p>`,
      "a<".repeat(500_000),
      "<h2>".repeat(100_000) + "</h3>".repeat(100_000),
      '<a href="#x">'.repeat(100_000),
    ];
    for (const input of inputs) {
      const start = performance.now();
      sanitizeRichText(input);
      expect(performance.now() - start).toBeLessThan(1000);
    }
  });
});

describe("sanitizeRichText - accessibility (RGAA)", () => {
  it("keeps the language of a phrase and leaves out invalid ones", () => {
    expect(sanitizeRichText('<p>Say <span lang="en">hello</span></p>')).toBe(
      '<p>Say <span lang="en">hello</span></p>',
    );
    expect(sanitizeRichText('<span lang="x&quot;onclick=1">a</span>')).toBe("<span>a</span>");
    expect(sanitizeRichText('<p dir="rtl">a</p><p dir="up">b</p>')).toBe(
      '<p dir="rtl">a</p><p>b</p>',
    );
  });

  it("keeps definition lists", () => {
    expect(sanitizeRichText("<dl><dt>Term</dt><dd>Definition</dd></dl>")).toBe(
      "<dl><dt>Term</dt><dd>Definition</dd></dl>",
    );
  });

  it("keeps table header associations, with prefixed ids", () => {
    expect(
      sanitizeRichText(
        '<table role="presentation"><tr><th id="h1" scope="col">A</th></tr><tr><td headers="h1">1</td></tr></table>',
        { idPrefix: P },
      ),
    ).toBe(
      `<table role="presentation"><tr><th id="${P}h1" scope="col">A</th></tr><tr><td headers="${P}h1">1</td></tr></table>`,
    );
    expect(sanitizeRichText('<table role="button"><tr><td>x</td></tr></table>')).toBe(
      "<table><tr><td>x</td></tr></table>",
    );
  });

  it("leaves out attributes that are not allowed on the element", () => {
    expect(sanitizeRichText('<p headers="y" role="presentation" scope="row">a</p>')).toBe(
      "<p>a</p>",
    );
  });

  it("renumbers headings under the given level and never skips a level", () => {
    expect(sanitizeRichText("<h2>A</h2><h4>B</h4>", { headingLevel: 3 })).toBe(
      "<h3>A</h3><h4>B</h4>",
    );
    expect(sanitizeRichText("<h4>A</h4><h2>B</h2>", { headingLevel: 3 })).toBe(
      "<h3>A</h3><h3>B</h3>",
    );
    expect(sanitizeRichText("<h1>A</h1><h3>B</h3>", { headingLevel: 2 })).toBe(
      "<h2>A</h2><h3>B</h3>",
    );
    expect(
      sanitizeRichText("<h2>A</h2><h3>B</h3><h4>C</h4><h5>D</h5><h6>E</h6>", { headingLevel: 4 }),
    ).toBe("<h4>A</h4><h5>B</h5><h6>C</h6><h6>D</h6><h6>E</h6>");
  });

  it("closes a heading before the next one starts, with matching levels", () => {
    expect(sanitizeRichText("<h2>a<h3>b</h3>c</h2>", { headingLevel: 3 })).toBe(
      "<h3>a</h3><h4>b</h4>c",
    );
    expect(sanitizeRichText("<h2><em>a</h2>b", { headingLevel: 3 })).toBe("<h3><em>a</em></h3>b");
  });

  it('gives an image without a text alternative alt="" and reports it', () => {
    expect(sanitizeRichTextWithReport('<img src="/a.png">')).toEqual({
      html: '<img alt="" src="/a.png">',
      imageWithoutAlt: true,
    });
    expect(sanitizeRichTextWithReport('<img src="/a.png" alt="">').imageWithoutAlt).toBe(false);
    expect(sanitizeRichTextWithReport('<img src="/b.png">').imageWithoutAlt).toBe(true);
    expect(sanitizeRichTextWithReport("<p>a</p>").imageWithoutAlt).toBe(false);
  });
});

describe("sanitizeRichText - ids and anchors", () => {
  it("prefixes the ids of every allowed element", () => {
    expect(
      sanitizeRichText('<p id="intro">a</p><span id="b">b</span><a id="c"></a>', { idPrefix: P }),
    ).toBe(`<p id="${P}intro">a</p><span id="${P}b">b</span><a id="${P}c"></a>`);
  });

  it("prefixes the anchors to an id declared in the same block", () => {
    expect(sanitizeRichText('<a href="#faq">up</a><h2 id="faq">FAQ</h2>', { idPrefix: P })).toBe(
      `<a href="#${P}faq">up</a><h3 id="${P}faq">FAQ</h3>`,
    );
  });

  it("keeps anchors to other targets of the page as written", () => {
    const question = "#q-0b1c2d3e-1111-2222-3333-444455556666";
    expect(sanitizeRichText(`<a href="${question}">x</a>`, { idPrefix: P })).toBe(
      `<a href="${question}">x</a>`,
    );
    expect(sanitizeRichText('<a href="#main-content">x</a>', { idPrefix: P })).toBe(
      '<a href="#main-content">x</a>',
    );
  });

  it("keeps the first of two elements with the same id", () => {
    expect(sanitizeRichText('<p id="a">1</p><p id="a">2</p>', { idPrefix: P })).toBe(
      `<p id="${P}a">1</p><p>2</p>`,
    );
  });

  it("leaves out ids that are not plain identifiers", () => {
    expect(sanitizeRichText('<p id="1a">a</p><p id="a b">b</p>')).toBe("<p>a</p><p>b</p>");
  });

  it("prefixes ids per block, so two blocks never share one", () => {
    const one = sanitizeRichText('<h2 id="intro">A</h2>', { idPrefix: "rt-aaaa-" });
    const two = sanitizeRichText('<h2 id="intro">A</h2>', { idPrefix: "rt-bbbb-" });
    expect(one).toBe('<h3 id="rt-aaaa-intro">A</h3>');
    expect(two).toBe('<h3 id="rt-bbbb-intro">A</h3>');
    expect(sanitizeRichText('<h2 id="intro">A</h2>', { idPrefix: '"><b>' })).toBe(
      '<h3 id="jsfaq-rt-intro">A</h3>',
    );
  });
});

describe("isSafeUrl", () => {
  it("rejects a scheme behind a relative-looking path", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("a/b:c")).toBe(false);
    expect(isSafeUrl("images/a.png")).toBe(true);
  });

  it("rejects backslashes and control characters anywhere", () => {
    expect(isSafeUrl("/a\\b")).toBe(false);
    expect(isSafeUrl("/a\nb")).toBe(false);
    expect(isSafeUrl("\u0001/a")).toBe(false);
    expect(isSafeUrl("  /a  ")).toBe(true);
  });
});

describe("htmlToPlainText", () => {
  it("decodes character references as the browser shows them", () => {
    expect(htmlToPlainText("<p>&uuml;ber &Agrave; &amp; &lt;b&gt; &#233; &#x2019;</p>")).toBe(
      "über À & <b> é ’",
    );
    expect(htmlToPlainText("<p>&copy 2026 &notin;</p>")).toBe("© 2026 ∉");
  });

  it("separates blocks and drops the markup", () => {
    expect(htmlToPlainText("<h2>A</h2><p>b<br>c</p><ul><li>d</li><li>e</li></ul>")).toBe(
      "A b c d e",
    );
  });

  it("leaves out the content of elements outside the allow-list", () => {
    expect(htmlToPlainText("<p>a</p><style>p{}</style><p>b</p>")).toBe("a b");
    expect(htmlToPlainText(undefined)).toBe("");
  });
});
