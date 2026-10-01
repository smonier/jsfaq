import type { JCRNodeWrapper } from "org.jahia.services.content";

export const PAGE_TYPE = "jsfaqnt:faqPage";
export const SECTION_TYPE = "jsfaqnt:faqSection";
export const ITEM_TYPE = "jsfaqnt:faqItem";

/** Child nodes of a node, in their order. */
export const getChildNodes = (node: JCRNodeWrapper): JCRNodeWrapper[] => {
  try {
    const iterator = node.getNodes();
    const children: JCRNodeWrapper[] = [];
    while (iterator.hasNext()) children.push(iterator.nextNode() as JCRNodeWrapper);
    return children;
  } catch {
    return [];
  }
};

/** Tags of a node (jmix:tagged), trimmed and without duplicates. */
export const getTags = (node: JCRNodeWrapper): string[] => {
  try {
    if (!node.hasProperty("j:tagList")) return [];
    const property = node.getProperty("j:tagList");
    const raw: string[] = [];
    if (property.isMultiple()) {
      const values = property.getValues();
      for (let i = 0; i < values.length; i++) raw.push(String(values[i].getString()));
    } else {
      raw.push(...String(property.getString()).split(","));
    }
    return [...new Set(raw.map((tag) => tag.trim()).filter(Boolean))];
  } catch {
    return [];
  }
};

/** A string property in the current language, trimmed, or "" when it is not set. */
export const getString = (node: JCRNodeWrapper, name: string): string => {
  try {
    return node.hasProperty(name) ? String(node.getProperty(name).getString()).trim() : "";
  } catch {
    return "";
  }
};

const parentOf = (node: JCRNodeWrapper): JCRNodeWrapper | null => {
  try {
    return node.getParent() as JCRNodeWrapper;
  } catch {
    return null;
  }
};

/** True when the node is of the type (or one of its subtypes). */
export const isType = (node: JCRNodeWrapper | null, type: string): boolean => {
  try {
    return Boolean(node && node.isNodeType(type));
  } catch {
    return false;
  }
};

/** Level of the FAQ title (h2 to h4), chosen by the editor because the FAQ cannot see its context. */
export const getPageLevel = (page: JCRNodeWrapper): number => {
  const level = Number(getString(page, "headingLevel"));
  return level >= 2 && level <= 4 ? level : 2;
};

/** Level of the headings right under the FAQ title: the title's own level when there is none. */
export const getPageContentLevel = (page: JCRNodeWrapper): number =>
  getPageLevel(page) + (getString(page, "jcr:title") ? 1 : 0);

export type Placement = {
  /** The FAQ the node belongs to, or null when the node was dropped on its own. */
  page: JCRNodeWrapper | null;
  /** Level of the node's own heading. */
  level: number;
  /** Paths whose change changes the node's rendering (the headings above it). */
  dependencies: string[];
};

/** Heading level of a section: right under the FAQ title, or h3 when dropped on its own. */
export const placeSection = (section: JCRNodeWrapper): Placement => {
  const parent = parentOf(section);
  if (parent && isType(parent, PAGE_TYPE)) {
    return {
      page: parent,
      level: Math.min(getPageContentLevel(parent), 6),
      dependencies: [parent.getPath()],
    };
  }
  return { page: null, level: 3, dependencies: [] };
};

/** Heading level of a question: under its section heading, or under the FAQ title. */
export const placeItem = (item: JCRNodeWrapper): Placement => {
  const parent = parentOf(item);
  if (!parent) return { page: null, level: 3, dependencies: [] };
  if (isType(parent, PAGE_TYPE)) {
    return {
      page: parent,
      level: Math.min(getPageContentLevel(parent), 6),
      dependencies: [parent.getPath()],
    };
  }
  if (isType(parent, SECTION_TYPE)) {
    const section = placeSection(parent);
    const titled = Boolean(getString(parent, "sectionTitle") || getString(parent, "jcr:title"));
    return {
      page: section.page,
      level: Math.min(section.level + (titled ? 1 : 0), 6),
      dependencies: [...section.dependencies, parent.getPath()],
    };
  }
  return { page: null, level: 3, dependencies: [] };
};

/** Short, stable prefix for the ids of a node's rich text. */
export const idPrefixFor = (node: JCRNodeWrapper, part: string): string =>
  `jsfaq-${part}-${String(node.getIdentifier()).slice(0, 8)}-`;
