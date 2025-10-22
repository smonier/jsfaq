import { jahiaComponent, getNodeProps } from "@jahia/javascript-modules-library";
import type { Resource } from "org.jahia.services.render";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import FaqItem from "./FaqItem";

type ServerProps = Record<string, unknown>;
type ServerContext = {
  currentResource?: Resource;
};

jahiaComponent(
  {
    nodeType: "jsfaqnt:faqItem",
    componentType: "view",
    displayName: "FAQ Item",
  },
  (_props: ServerProps, context: ServerContext) => {
    const { currentResource } = context;

    // Get current node
    const node = (() => {
      try {
        if (!currentResource || typeof currentResource.getNode !== "function") return null;
        return currentResource.getNode() as JCRNodeWrapper;
      } catch {
        return null;
      }
    })();

    if (!node) {
      return <div />;
    }

    // Get item properties
    const props = getNodeProps<Record<string, unknown>>(node, [
      "jcr:uuid",
      "question",
      "answer",
      "isFeatured",
      "jcr:title",
    ]);

    const uuid = String(props["jcr:uuid"] || "");
    const question = String(props["question"] || props["jcr:title"] || "");
    const answerHtml = String(props["answer"] || "");

    // Get tags from Jahia's jmix:tagged
    const tags = (() => {
      try {
        if (!node.hasProperty || !node.hasProperty("j:tagList")) return [];

        // Try to get as property which might return an array
        const property = node.getProperty("j:tagList");
        if (!property) return [];

        // Check if it's a multi-valued property
        if (property.isMultiple && property.isMultiple()) {
          const values = property.getValues();
          const tagArray: string[] = [];
          for (let i = 0; i < values.length; i++) {
            const val = values[i].getString();
            if (val) tagArray.push(val);
          }
          return tagArray;
        }

        // Single value - split by comma if needed
        const tagList = property.getString();
        if (!tagList) return [];
        return String(tagList)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      } catch {
        return [];
      }
    })();

    const isFeatured = Boolean(props["isFeatured"]);

    // Simple server-side rendering - client handles interactivity
    const item = {
      uuid,
      question,
      answerHtml,
      answerText: "",
      tags,
      isFeatured,
    };

    // Minimal strings for server render (client will handle real ones)
    const strings = {
      featured: "Featured",
      tagsLabel: "Tags",
    };

    return <FaqItem item={item} isOpen={false} strings={strings} />;
  },
);
