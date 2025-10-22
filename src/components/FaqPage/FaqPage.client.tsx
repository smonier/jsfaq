import { useEffect } from "react";
import type { FaqInitialProps, FaqItem, FaqStrings } from "../../types";

const DATA_ATTRIBUTE = "data-faq-props";

const HASH_PREFIX = "q-";

type ItemEntry = {
  id: string;
  element: HTMLElement;
  toggle?: HTMLButtonElement | null;
  answer?: HTMLElement | null;
  sectionId: string | null;
  data: FaqItem;
  defaultOrder: number;
};

type SectionEntry = {
  id: string;
  element: HTMLElement;
};

type FaqState = {
  searchTerm: string;
  activeTags: Set<string>;
  featuredFirst: boolean;
  openItems: Set<string>;
};

const parseInitialProps = (): FaqInitialProps | null => {
  const script = document.querySelector<HTMLScriptElement>(`script[${DATA_ATTRIBUTE}]`);
  if (!script) return null;
  try {
    const json = script.textContent || script.innerText || "";
    if (!json) return null;
    return JSON.parse(json) as FaqInitialProps;
  } catch {
    return null;
  }
};

const normalizeText = (value: string): string => value.toLowerCase();

class FaqController {
  private readonly root: HTMLElement;
  private readonly props: FaqInitialProps;
  private readonly strings: FaqStrings;
  private readonly items: Map<string, ItemEntry> = new Map();
  private readonly sections: SectionEntry[] = [];
  private state: FaqState;
  private searchInput?: HTMLInputElement | null;
  private featuredToggle?: HTMLInputElement | null;
  private clearButton?: HTMLButtonElement | null;
  private expandAllButton?: HTMLButtonElement | null;
  private collapseAllButton?: HTMLButtonElement | null;
  private emptyState?: HTMLElement | null;
  private destroyers: Array<() => void> = [];
  private openClassName: string;
  private tagActiveClassName: string;

  constructor(root: HTMLElement, props: FaqInitialProps) {
    this.root = root;
    this.props = props;
    this.strings = props.strings;
    this.openClassName = root.getAttribute("data-faq-open-class") || "jsfaq-item--open";
    this.tagActiveClassName = root.getAttribute("data-faq-tag-active-class") || "jsfaq-tag--active";
    this.state = {
      searchTerm: "",
      activeTags: new Set<string>(),
      featuredFirst: props.featuredFirstDefault,
      openItems: new Set<string>(),
    };
  }

  init() {
    this.collectElements();
    this.collectItems();
    this.attachEventListeners();
    this.state.openItems = new Set(); // Start with all items closed
    this.applyFeaturedFirstState();
    this.applyFilters();
    this.applyOpenState();
    this.syncFromHash();
  }

  dispose() {
    this.destroyers.forEach((destroy) => {
      try {
        destroy();
      } catch {
        // ignore teardown errors
      }
    });
  }

  private collectElements() {
    this.searchInput = this.root.querySelector<HTMLInputElement>("[data-faq-search]");
    this.featuredToggle = this.root.querySelector<HTMLInputElement>("[data-faq-featured]");
    this.clearButton = this.root.querySelector<HTMLButtonElement>("[data-faq-clear]");
    this.expandAllButton = this.root.querySelector<HTMLButtonElement>("[data-faq-expand-all]");
    this.collapseAllButton = this.root.querySelector<HTMLButtonElement>("[data-faq-collapse-all]");
    this.emptyState = this.root.querySelector<HTMLElement>("[data-faq-empty]");

    this.root.querySelectorAll<HTMLElement>("[data-faq-section-id]").forEach((sectionEl) => {
      const id = sectionEl.getAttribute("data-faq-section-id");
      if (id) {
        this.sections.push({ id, element: sectionEl });
      }
    });
  }

  private collectItems() {
    const flattened = new Map<string, FaqItem>();

    const registerItems = (items: FaqItem[]) => {
      items.forEach((item) => {
        flattened.set(item.uuid, item);
      });
    };

    registerItems(this.props.page.items);
    this.props.page.sections.forEach((section) => registerItems(section.items));

    let index = 0;
    this.root.querySelectorAll<HTMLElement>("[data-faq-item]").forEach((element) => {
      const id = element.getAttribute("data-faq-id");
      if (!id) return;

      const data = flattened.get(id);
      if (!data) return;

      const toggle = element.querySelector<HTMLButtonElement>("[data-faq-toggle]");
      const answer = element.querySelector<HTMLElement>("[data-faq-answer]");
      const section = element.closest<HTMLElement>("[data-faq-section-id]");

      this.items.set(id, {
        id,
        element,
        toggle,
        answer,
        sectionId: section?.getAttribute("data-faq-section-id") ?? null,
        data,
        defaultOrder: index,
      });
      index += 1;
    });
  }

  private attachEventListeners() {
    const onSearchInput = (event: Event) => {
      const value = (event.target as HTMLInputElement).value;
      this.state.searchTerm = value;
      this.applyFilters();
    };
    if (this.searchInput) {
      this.searchInput.addEventListener("input", onSearchInput);
      this.destroyers.push(() => this.searchInput?.removeEventListener("input", onSearchInput));
    }

    const onFeaturedChange = (event: Event) => {
      const checked = (event.target as HTMLInputElement).checked;
      this.state.featuredFirst = checked;
      this.applyFeaturedFirstState();
      this.applyFilters();
    };
    if (this.featuredToggle) {
      this.featuredToggle.addEventListener("change", onFeaturedChange);
      this.destroyers.push(() =>
        this.featuredToggle?.removeEventListener("change", onFeaturedChange),
      );
      this.featuredToggle.checked = this.state.featuredFirst;
    }

    const onClear = () => {
      this.state.searchTerm = "";
      if (this.searchInput) {
        this.searchInput.value = "";
      }
      this.state.activeTags.clear();
      this.state.featuredFirst = this.props.featuredFirstDefault;
      if (this.featuredToggle) {
        this.featuredToggle.checked = this.state.featuredFirst;
      }
      this.applyFeaturedFirstState();
      this.updateTagButtons();
      this.applyFilters();
    };
    if (this.clearButton) {
      this.clearButton.addEventListener("click", onClear);
      this.destroyers.push(() => this.clearButton?.removeEventListener("click", onClear));
    }

    const onExpandAll = () => {
      this.items.forEach((entry) => this.state.openItems.add(entry.id));
      this.applyOpenState();
      this.updateUrlHash(null);
    };
    if (this.expandAllButton) {
      this.expandAllButton.addEventListener("click", onExpandAll);
      this.destroyers.push(() => this.expandAllButton?.removeEventListener("click", onExpandAll));
    }

    const onCollapseAll = () => {
      this.items.forEach((entry) => this.state.openItems.delete(entry.id));
      this.applyOpenState();
      this.updateUrlHash(null);
    };
    if (this.collapseAllButton) {
      this.collapseAllButton.addEventListener("click", onCollapseAll);
      this.destroyers.push(() =>
        this.collapseAllButton?.removeEventListener("click", onCollapseAll),
      );
    }

    const onRootClick = (event: Event) => {
      const target = event.target as HTMLElement;

      const tagButton = target.closest<HTMLButtonElement>("[data-faq-tag]");
      if (tagButton) {
        const tag = tagButton.getAttribute("data-faq-tag");
        if (tag) {
          if (this.state.activeTags.has(tag)) {
            this.state.activeTags.delete(tag);
          } else {
            this.state.activeTags.add(tag);
          }
          this.updateTagButtons();
          this.applyFilters();
        }
        return;
      }

      const toggleButton = target.closest<HTMLButtonElement>("[data-faq-toggle]");
      if (toggleButton) {
        const itemEl = toggleButton.closest<HTMLElement>("[data-faq-item]");
        const id = itemEl?.getAttribute("data-faq-id");
        if (id) {
          if (this.state.openItems.has(id)) {
            this.state.openItems.delete(id);
          } else {
            this.state.openItems.add(id);
          }
          this.applyOpenState();
          if (this.state.openItems.has(id)) {
            this.updateUrlHash(id);
          }
        }
        return;
      }
    };

    this.root.addEventListener("click", onRootClick);
    this.destroyers.push(() => this.root.removeEventListener("click", onRootClick));

    const onHashChange = () => {
      this.syncFromHash();
    };
    window.addEventListener("hashchange", onHashChange);
    this.destroyers.push(() => window.removeEventListener("hashchange", onHashChange));
  }

  private highlightText(element: HTMLElement, searchTerm: string) {
    // Remove existing highlights
    element.querySelectorAll("mark[data-faq-highlight]").forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
        parent.normalize();
      }
    });

    if (!searchTerm || searchTerm.length < 2) return;

    const normalizedSearch = normalizeText(searchTerm);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    const nodesToReplace: { node: Text; matches: Array<{ start: number; end: number }> }[] = [];

    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      if (!node.textContent) continue;
      const normalized = normalizeText(node.textContent);
      const matches: Array<{ start: number; end: number }> = [];
      let index = 0;

      while ((index = normalized.indexOf(normalizedSearch, index)) !== -1) {
        matches.push({ start: index, end: index + normalizedSearch.length });
        index += normalizedSearch.length;
      }

      if (matches.length > 0) {
        nodesToReplace.push({ node, matches });
      }
    }

    nodesToReplace.forEach(({ node, matches }) => {
      const text = node.textContent || "";
      const parent = node.parentNode;
      if (!parent) return;

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      matches.forEach(({ start, end }) => {
        if (start > lastIndex) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex, start)));
        }
        const mark = document.createElement("mark");
        mark.setAttribute("data-faq-highlight", "true");
        mark.style.backgroundColor = "#fef08a";
        mark.style.padding = "0 2px";
        mark.style.borderRadius = "2px";
        mark.textContent = text.substring(start, end);
        fragment.appendChild(mark);
        lastIndex = end;
      });

      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }

      parent.replaceChild(fragment, node);
    });
  }

  private applyFilters() {
    const query = normalizeText(this.state.searchTerm.trim());
    const hasQuery = query.length > 0;
    const activeTags = Array.from(this.state.activeTags.values());
    const sectionMatches = new Map<string, number>();
    let visibleCount = 0;

    this.items.forEach((entry) => {
      const haystack = normalizeText(`${entry.data.question} ${entry.data.answerText ?? ""}`);
      let matches = true;
      if (hasQuery) {
        matches = haystack.includes(query);
      }

      if (matches && activeTags.length) {
        const itemTags = entry.data.tags ?? [];
        matches = activeTags.every((tag) => itemTags.includes(tag));
      }

      entry.element.toggleAttribute("data-faq-hidden", !matches);
      entry.element.toggleAttribute("hidden", !matches);

      // Highlight search term and open item if it matches
      if (hasQuery && entry.answer) {
        if (matches) {
          this.highlightText(entry.answer, this.state.searchTerm.trim());
          // Open items that match the search
          this.state.openItems.add(entry.id);
        } else {
          this.highlightText(entry.answer, ""); // Clear highlights
        }
      } else if (!hasQuery && entry.answer) {
        this.highlightText(entry.answer, ""); // Clear highlights when no search
      }

      if (matches) {
        visibleCount += 1;
        if (entry.sectionId) {
          sectionMatches.set(entry.sectionId, (sectionMatches.get(entry.sectionId) ?? 0) + 1);
        }
      }
    });

    this.sections.forEach((section) => {
      const count = sectionMatches.get(section.id) ?? 0;
      const hideSection = count === 0;
      section.element.toggleAttribute("data-faq-section-hidden", hideSection);
      section.element.toggleAttribute("hidden", hideSection);
    });

    if (this.emptyState) {
      if (visibleCount === 0) {
        this.emptyState.removeAttribute("hidden");
      } else {
        this.emptyState.setAttribute("hidden", "true");
      }
    }

    const filtersActive =
      hasQuery ||
      activeTags.length > 0 ||
      this.state.featuredFirst !== this.props.featuredFirstDefault;
    if (this.clearButton) {
      this.clearButton.disabled = !filtersActive;
    }

    this.reorderItems();
    this.applyOpenState(); // Apply open/closed state after filtering
  }

  private applyOpenState() {
    this.items.forEach((entry) => {
      const isOpen = this.state.openItems.has(entry.id);
      entry.element.classList.toggle(this.openClassName, isOpen);
      if (entry.toggle) {
        entry.toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
    });
  }

  private updateTagButtons() {
    const activeTags = this.state.activeTags;
    this.root.querySelectorAll<HTMLButtonElement>("[data-faq-tag]").forEach((button) => {
      const tag = button.getAttribute("data-faq-tag");
      const isActive = tag ? activeTags.has(tag) : false;
      button.classList.toggle(this.tagActiveClassName, isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  private applyFeaturedFirstState() {
    if (this.featuredToggle) {
      this.featuredToggle.checked = this.state.featuredFirst;
    }
    this.reorderItems();
  }

  private reorderItems() {
    const featuredFirst = this.state.featuredFirst;
    this.items.forEach((entry) => {
      if (featuredFirst) {
        const priority = entry.data.isFeatured ? "0" : "1";
        entry.element.style.order = `${priority}-${entry.defaultOrder.toString().padStart(4, "0")}`;
      } else {
        entry.element.style.order = "";
      }
    });
  }

  private syncFromHash() {
    const hash = window.location.hash.replace("#", "");
    if (!hash.startsWith(HASH_PREFIX)) return;
    const id = hash.slice(HASH_PREFIX.length);
    if (!this.items.has(id)) return;

    this.state.openItems.add(id);
    this.applyOpenState();

    const entry = this.items.get(id);
    if (entry?.element) {
      entry.element.scrollIntoView({ block: "start", behavior: "smooth" });
      entry.element.focus?.();
    }
  }

  private updateUrlHash(id: string | null) {
    const url = new URL(window.location.href);
    if (id) {
      url.hash = `${HASH_PREFIX}${id}`;
    } else {
      url.hash = "";
    }
    window.history.replaceState({}, "", url.toString());
  }
}

const FaqPageClient = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const props = parseInitialProps();
    if (!props) return;

    const root = document.querySelector<HTMLElement>("[data-faq-root]");
    if (!root) return;

    let controller: FaqController | null = null;
    let disposed = false;

    const initialize = () => {
      if (disposed || controller) return;
      controller = new FaqController(root, props);
      controller.init();
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          initialize();
        }
      });
      observer.observe(root);
      return () => {
        disposed = true;
        observer.disconnect();
        controller?.dispose();
      };
    }

    initialize();

    return () => {
      disposed = true;
      controller?.dispose();
    };
  }, []);

  return null;
};

export default FaqPageClient;
