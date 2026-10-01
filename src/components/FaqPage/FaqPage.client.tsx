import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { fold, hashTarget, parseTags } from "./text";

const STATUS_DELAY = 600;
const ID_REFERENCES = ["for", "aria-labelledby", "aria-describedby", "aria-controls", "headers"];

type Messages = {
  count: (count: number) => string;
  none: string;
};

type ItemEntry = {
  element: HTMLDetailsElement;
  toggle: HTMLElement;
  question: HTMLElement;
  answer: HTMLElement;
  section: HTMLElement | null;
  /** Question and answer text, folded for matching. */
  text: string;
  tags: string[];
};

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Gives the elements of a FAQ shown a second time on the page (the same content placed twice)
 * ids of their own, and points the labels, ARIA references and anchors of that copy at them.
 */
const makeIdsUnique = (root: HTMLElement) => {
  const renamed = new Map<string, string>();
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>("[id]"))];
  for (const element of elements) {
    const id = element.id;
    if (!id || document.getElementById(id) === element) continue;
    let n = 2;
    while (document.getElementById(`${id}-${n}`)) n++;
    element.id = `${id}-${n}`;
    renamed.set(id, element.id);
  }
  if (renamed.size === 0) return;
  for (const name of ID_REFERENCES) {
    root.querySelectorAll(`[${name}]`).forEach((element) => {
      const value = element.getAttribute(name) ?? "";
      element.setAttribute(
        name,
        value
          .split(/\s+/)
          .map((id) => renamed.get(id) ?? id)
          .join(" "),
      );
    });
  }
  root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    const target = renamed.get(hashTarget(anchor.getAttribute("href") ?? ""));
    if (target) anchor.setAttribute("href", `#${target}`);
  });
};

/**
 * Drives one FAQ rendered by the server view: search, tag filter, "expand all" and "collapse
 * all", and the link to a question (#q-<id>). Each question is a native disclosure (`<details>`),
 * so the answers open and close without this script; it reads its state from the markup, and
 * puts the markup back when it is disposed.
 */
class FaqController {
  private readonly root: HTMLElement;
  private readonly messages: Messages;
  private readonly items: ItemEntry[] = [];
  private readonly sections: HTMLElement[] = [];
  private readonly activeTags = new Set<string>();
  private readonly destroyers: Array<() => void> = [];
  private readonly tagActiveClass: string;
  private readonly highlightClass: string;
  private search: HTMLInputElement | null = null;
  private status: HTMLElement | null = null;
  private tagButtons: HTMLButtonElement[] = [];
  private term = "";
  private statusTimer: number | undefined;

  constructor(root: HTMLElement, messages: Messages) {
    this.root = root;
    this.messages = messages;
    this.tagActiveClass = root.dataset.faqTagActiveClass || "jsfaq-tag--active";
    this.highlightClass = root.dataset.faqHighlightClass || "jsfaq-highlight";
  }

  /** True when the element belongs to this FAQ, not to another one placed inside it. */
  private owns(element: Element) {
    return element.closest("[data-faq-root]") === this.root;
  }

  init() {
    makeIdsUnique(this.root);
    this.root.querySelectorAll<HTMLDetailsElement>("details[data-faq-item]").forEach((element) => {
      const toggle = element.querySelector<HTMLElement>(":scope > summary");
      const answer = element.querySelector<HTMLElement>("[data-faq-answer]");
      if (!toggle || !answer || !this.owns(element)) return;
      const question = toggle.querySelector<HTMLElement>("[data-faq-question]") ?? toggle;
      this.items.push({
        element,
        toggle,
        question,
        answer,
        section: element.closest<HTMLElement>("[data-faq-section]"),
        text: fold(`${question.textContent ?? ""} ${answer.textContent ?? ""}`),
        tags: parseTags(element.dataset.faqTags),
      });
    });
    this.root.querySelectorAll<HTMLElement>("[data-faq-section]").forEach((section) => {
      if (this.owns(section)) this.sections.push(section);
    });

    this.search = this.root.querySelector<HTMLInputElement>("[data-faq-search]");
    this.status = this.root.querySelector<HTMLElement>("[data-faq-status]");
    this.tagButtons = Array.from(this.root.querySelectorAll<HTMLButtonElement>("[data-faq-tag]"));

    // The search and the pressed tags survive a new controller on the same markup.
    this.term = this.search?.value.trim() ?? "";
    this.tagButtons.forEach((button) => {
      if (button.getAttribute("aria-pressed") === "true")
        this.activeTags.add(button.dataset.faqTag ?? "");
    });

    this.listen();
    this.applyFilters({ announce: false });
    this.syncFromHash(false);
  }

  dispose() {
    window.clearTimeout(this.statusTimer);
    this.destroyers.forEach((destroy) => destroy());
    // Back to the server markup, but for the search text and the pressed tags (read by `init`).
    this.items.forEach((entry) => {
      this.highlight(entry, "");
      entry.element.hidden = false;
    });
    this.sections.forEach((section) => {
      section.hidden = false;
    });
    this.setStatus("");
  }

  private on<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
  ) {
    target.addEventListener(type, handler);
    this.destroyers.push(() => target.removeEventListener(type, handler));
  }

  private listen() {
    if (this.search) {
      const search = this.search;
      this.on(search, "input", () => {
        this.term = search.value.trim();
        this.applyFilters({ announce: true, delayed: true });
      });
    }

    this.on(this.root, "click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target || !this.owns(target)) return;

      const tagButton = target.closest<HTMLButtonElement>("[data-faq-tag]");
      if (tagButton) {
        const tag = tagButton.dataset.faqTag ?? "";
        if (this.activeTags.has(tag)) this.activeTags.delete(tag);
        else this.activeTags.add(tag);
        this.applyFilters({ announce: true });
        return;
      }

      if (target.closest("[data-faq-expand-all]")) {
        this.items.forEach((entry) => {
          if (!entry.element.hidden) entry.element.open = true;
        });
        this.clearOwnHash();
        return;
      }

      if (target.closest("[data-faq-collapse-all]")) {
        this.items.forEach((entry) => {
          entry.element.open = false;
        });
        this.clearOwnHash();
        return;
      }

      // A question about to open becomes the page's link target.
      const toggle = target.closest("summary");
      const entry = this.items.find((item) => item.toggle === toggle);
      if (entry && !entry.element.open) this.setHash(entry.element.id);
    });

    const onHashChange = () => this.syncFromHash(true);
    window.addEventListener("hashchange", onHashChange);
    this.destroyers.push(() => window.removeEventListener("hashchange", onHashChange));
  }

  private applyFilters({ announce, delayed = false }: { announce: boolean; delayed?: boolean }) {
    const query = fold(this.term);
    const tags = [...this.activeTags];
    const filtered = Boolean(query) || tags.length > 0;
    const visibleSections = new Set<HTMLElement>();
    let visible = 0;

    this.tagButtons.forEach((button) => {
      const pressed = this.activeTags.has(button.dataset.faqTag ?? "");
      button.setAttribute("aria-pressed", pressed ? "true" : "false");
      button.classList.toggle(this.tagActiveClass, pressed);
    });

    this.items.forEach((entry) => {
      const matches =
        (!query || entry.text.includes(query)) && tags.every((tag) => entry.tags.includes(tag));
      entry.element.hidden = !matches;
      this.highlight(entry, matches && query.length >= 2 ? query : "");
      if (!matches) return;
      visible += 1;
      if (entry.section) visibleSections.add(entry.section);
      // Show the answer that matched the search, with the match highlighted.
      if (query) entry.element.open = true;
    });

    // While a filter is on, a section with no matching question is hidden, empty ones included.
    this.sections.forEach((section) => {
      section.hidden = filtered && !visibleSections.has(section);
    });

    window.clearTimeout(this.statusTimer);
    if (!announce) return;
    const message = !filtered
      ? ""
      : visible === 0
        ? this.messages.none
        : this.messages.count(visible);
    // Typing announces the count once the visitor pauses, not on every keystroke (RGAA 7.5).
    if (delayed) {
      this.statusTimer = window.setTimeout(() => this.setStatus(message), STATUS_DELAY);
    } else {
      this.setStatus(message);
    }
  }

  private setStatus(message: string) {
    if (this.status && this.status.textContent !== message) this.status.textContent = message;
  }

  /** Clears the search and the tags, so that every question shows again. */
  private resetFilters() {
    this.term = "";
    if (this.search) this.search.value = "";
    this.activeTags.clear();
    this.applyFilters({ announce: true });
  }

  /** Wraps each match of `query` (folded) in a <mark>, in the question and the answer. */
  private highlight(entry: ItemEntry, query: string) {
    for (const container of [entry.question, entry.answer]) {
      const marks = container.querySelectorAll("mark[data-faq-highlight]");
      marks.forEach((mark) => {
        mark.replaceWith(document.createTextNode(mark.textContent ?? ""));
      });
      if (marks.length) container.normalize();
      if (!query) continue;

      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);

      for (const node of nodes) {
        const text = node.data;
        const folded = fold(text);
        let from = 0;
        let at = folded.indexOf(query);
        if (at === -1) continue;
        const fragment = document.createDocumentFragment();
        while (at !== -1) {
          if (at > from) fragment.append(text.slice(from, at));
          const mark = document.createElement("mark");
          mark.dataset.faqHighlight = "true";
          mark.className = this.highlightClass;
          mark.textContent = text.slice(at, at + query.length);
          fragment.append(mark);
          from = at + query.length;
          at = folded.indexOf(query, from);
        }
        if (from < text.length) fragment.append(text.slice(from));
        node.replaceWith(fragment);
      }
    }
  }

  private syncFromHash(focus: boolean) {
    const id = hashTarget(window.location.hash);
    if (!id) return;
    const entry = this.items.find((item) => item.element.id === id);
    if (!entry) return;
    // A question hidden by the search or the tags is shown again, with all the others.
    if (entry.element.hidden) this.resetFilters();
    entry.element.open = true;
    entry.element.scrollIntoView({
      block: "start",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    if (focus || document.activeElement === document.body)
      entry.toggle.focus({ preventScroll: true });
  }

  private setHash(id: string) {
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.replaceState(window.history.state, "", url.toString());
  }

  private clearOwnHash() {
    const id = hashTarget(window.location.hash);
    if (!id || !this.items.some((item) => item.element.id === id)) return;
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(window.history.state, "", url.toString());
  }
}

/**
 * Island of one FAQ, rendered inside the FAQ markup: it attaches the controller to the FAQ that
 * contains it, so a FAQ shown twice on a page gets one controller per copy.
 */
const FaqPageClient = () => {
  const { t } = useTranslation("jsfaq");
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>("[data-faq-root]");
    if (!root) return;
    const controller = new FaqController(root, {
      count: (count) => t("resultCount", { count }),
      none: t("noResults"),
    });
    controller.init();
    return () => controller.dispose();
  }, [t]);

  return <span ref={anchor} hidden />;
};

export default FaqPageClient;
