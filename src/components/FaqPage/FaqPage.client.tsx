import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const HASH_PREFIX = "q-";
const STATUS_DELAY = 600;

type Messages = {
  count: (count: number) => string;
  none: string;
};

type ItemEntry = {
  id: string;
  element: HTMLElement;
  toggle: HTMLButtonElement;
  question: HTMLElement;
  answer: HTMLElement;
  section: HTMLElement | null;
  /** Question and answer text, folded for matching. */
  text: string;
  tags: string[];
};

/**
 * Folds a text for matching, one UTF-16 unit for one, so that match positions stay valid in the
 * original text: lower case, without diacritics ("Été" matches "ete").
 */
const fold = (value: string): string => {
  let out = "";
  for (const c of value) {
    const base = c.normalize("NFD")[0] ?? c;
    const lower = base.toLowerCase();
    const unit = lower.length === 1 ? lower : base;
    out += c.length === unit.length ? unit : c;
  }
  return out;
};

const parseTags = (value: string | null): string[] => {
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

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Drives one FAQ rendered by the server view: disclosure of the answers, search, tag filter,
 * "expand all" and "collapse all", and the link to a question (#q-<id>).
 *
 * Everything it needs is read from the markup, so no content is serialised for the browser. The
 * server renders every answer open and the controls hidden, so the FAQ stays readable without
 * JavaScript; this controller reveals the controls and closes the answers.
 */
class FaqController {
  private readonly root: HTMLElement;
  private readonly messages: Messages;
  private readonly items = new Map<string, ItemEntry>();
  private readonly sections = new Set<HTMLElement>();
  private readonly open = new Set<string>();
  private readonly activeTags = new Set<string>();
  private readonly destroyers: Array<() => void> = [];
  private readonly openClass: string;
  private readonly tagActiveClass: string;
  private readonly highlightClass: string;
  private search: HTMLInputElement | null = null;
  private status: HTMLElement | null = null;
  private term = "";
  private statusTimer: number | undefined;

  constructor(root: HTMLElement, messages: Messages) {
    this.root = root;
    this.messages = messages;
    this.openClass = root.dataset.faqOpenClass || "jsfaq-item--open";
    this.tagActiveClass = root.dataset.faqTagActiveClass || "jsfaq-tag--active";
    this.highlightClass = root.dataset.faqHighlightClass || "jsfaq-highlight";
  }

  init() {
    this.root.querySelectorAll<HTMLElement>("[data-faq-item]").forEach((element) => {
      const id = element.dataset.faqId;
      const toggle = element.querySelector<HTMLButtonElement>("[data-faq-toggle]");
      const answer = element.querySelector<HTMLElement>("[data-faq-answer]");
      // An item of another FAQ nested in this one belongs to that FAQ's controller.
      if (!id || !toggle || !answer || element.closest("[data-faq-root]") !== this.root) return;
      const question = toggle.querySelector<HTMLElement>("[data-faq-question]") ?? toggle;
      const section = element.closest<HTMLElement>("[data-faq-section]");
      if (section) this.sections.add(section);
      this.items.set(id, {
        id,
        element,
        toggle,
        question,
        answer,
        section,
        text: fold(`${question.textContent ?? ""} ${answer.textContent ?? ""}`),
        tags: parseTags(element.dataset.faqTags ?? null),
      });
    });

    this.search = this.root.querySelector<HTMLInputElement>("[data-faq-search]");
    this.status = this.root.querySelector<HTMLElement>("[data-faq-status]");
    this.listen();

    this.root.querySelectorAll<HTMLElement>("[data-faq-controls]").forEach((controls) => {
      controls.hidden = false;
    });
    this.applyOpenState();
    this.syncFromHash(false);
  }

  dispose() {
    window.clearTimeout(this.statusTimer);
    this.destroyers.forEach((destroy) => destroy());
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
        this.applyFilters(true);
      });
    }

    this.on(this.root, "click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const tagButton = target.closest<HTMLButtonElement>("[data-faq-tag]");
      if (tagButton && this.root.contains(tagButton)) {
        const tag = tagButton.dataset.faqTag ?? "";
        if (this.activeTags.has(tag)) this.activeTags.delete(tag);
        else this.activeTags.add(tag);
        const pressed = this.activeTags.has(tag);
        tagButton.setAttribute("aria-pressed", pressed ? "true" : "false");
        tagButton.classList.toggle(this.tagActiveClass, pressed);
        this.applyFilters(false);
        return;
      }

      if (target.closest("[data-faq-expand-all]")) {
        this.items.forEach((entry) => {
          if (!entry.element.hidden) this.open.add(entry.id);
        });
        this.applyOpenState();
        this.clearOwnHash();
        return;
      }

      if (target.closest("[data-faq-collapse-all]")) {
        this.open.clear();
        this.applyOpenState();
        this.clearOwnHash();
        return;
      }

      const toggle = target.closest<HTMLButtonElement>("[data-faq-toggle]");
      const id = toggle?.closest<HTMLElement>("[data-faq-item]")?.dataset.faqId;
      if (!id || !this.items.has(id)) return;
      if (this.open.has(id)) {
        this.open.delete(id);
      } else {
        this.open.add(id);
        this.setHash(id);
      }
      this.applyOpenState();
    });

    const onHashChange = () => this.syncFromHash(true);
    window.addEventListener("hashchange", onHashChange);
    this.destroyers.push(() => window.removeEventListener("hashchange", onHashChange));
  }

  private applyFilters(fromTyping: boolean) {
    const query = fold(this.term);
    const tags = [...this.activeTags];
    const visibleSections = new Set<HTMLElement>();
    let visible = 0;

    this.items.forEach((entry) => {
      const matches =
        (!query || entry.text.includes(query)) && tags.every((tag) => entry.tags.includes(tag));
      entry.element.hidden = !matches;
      this.highlight(entry, matches && query.length >= 2 ? query : "");
      if (!matches) return;
      visible += 1;
      if (entry.section) visibleSections.add(entry.section);
      // Show the answer that matched the search, with the match highlighted.
      if (query) this.open.add(entry.id);
    });

    this.sections.forEach((section) => {
      section.hidden = !visibleSections.has(section);
    });
    this.applyOpenState();

    // Typing announces the count once the visitor pauses, not on every keystroke (RGAA 7.5).
    window.clearTimeout(this.statusTimer);
    const filtered = Boolean(query) || tags.length > 0;
    const message = !filtered
      ? ""
      : visible === 0
        ? this.messages.none
        : this.messages.count(visible);
    if (fromTyping) {
      this.statusTimer = window.setTimeout(() => this.setStatus(message), STATUS_DELAY);
    } else {
      this.setStatus(message);
    }
  }

  private setStatus(message: string) {
    if (this.status && this.status.textContent !== message) this.status.textContent = message;
  }

  private applyOpenState() {
    this.items.forEach((entry) => {
      const isOpen = this.open.has(entry.id);
      entry.element.classList.toggle(this.openClass, isOpen);
      entry.toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      entry.answer.hidden = !isOpen;
    });
  }

  /** Wraps each match of `query` (folded) in a <mark>, in the question and the answer. */
  private highlight(entry: ItemEntry, query: string) {
    for (const container of [entry.question, entry.answer]) {
      container.querySelectorAll("mark[data-faq-highlight]").forEach((mark) => {
        mark.replaceWith(document.createTextNode(mark.textContent ?? ""));
      });
      container.normalize();
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
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash.startsWith(HASH_PREFIX)) return;
    const entry = this.items.get(hash.slice(HASH_PREFIX.length));
    if (!entry) return;
    entry.element.hidden = false;
    this.open.add(entry.id);
    this.applyOpenState();
    entry.element.scrollIntoView({
      block: "start",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    if (focus || document.activeElement === document.body)
      entry.toggle.focus({ preventScroll: true });
  }

  private setHash(id: string) {
    const url = new URL(window.location.href);
    url.hash = `${HASH_PREFIX}${id}`;
    window.history.replaceState(window.history.state, "", url.toString());
  }

  private clearOwnHash() {
    const hash = window.location.hash.slice(1);
    if (!hash.startsWith(HASH_PREFIX) || !this.items.has(hash.slice(HASH_PREFIX.length))) return;
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(window.history.state, "", url.toString());
  }
}

/** Island of one FAQ: attaches the controller to the FAQ markup whose id it receives. */
const FaqPageClient = ({ rootId }: { rootId: string }) => {
  const { t } = useTranslation("jsfaq");

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const controller = new FaqController(root, {
      count: (count) => t("resultCount", { count }),
      none: t("noResults"),
    });
    controller.init();
    return () => controller.dispose();
  }, [rootId, t]);

  return null;
};

export default FaqPageClient;
