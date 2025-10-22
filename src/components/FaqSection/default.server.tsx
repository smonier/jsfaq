import { jahiaComponent, RenderChildren, getNodeProps } from "@jahia/javascript-modules-library";
import type { Resource } from "org.jahia.services.render";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import classes from "../../styles/faq.module.css";

type ServerProps = Record<string, unknown>;
type ServerContext = {
  currentResource?: Resource;
};

jahiaComponent(
  {
    nodeType: "jsfaqnt:faqSection",
    componentType: "view",
    displayName: "FAQ Section",
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

    // Get section properties
    const props = getNodeProps<Record<string, unknown>>(node, [
      "jcr:uuid",
      "sectionTitle",
      "sectionDescription",
      "jcr:title",
    ]);

    const uuid = String(props["jcr:uuid"] || "");
    const sectionTitle = String(props["sectionTitle"] || props["jcr:title"] || "");
    const sectionDescription = props["sectionDescription"]
      ? String(props["sectionDescription"])
      : undefined;

    return (
      <section className={classes.jsfaq__section} data-faq-section-id={uuid}>
        <header className={classes.jsfaq__section__header}>
          <h2 className={classes.jsfaq__section__title}>{sectionTitle}</h2>
          {sectionDescription ? (
            <div
              className={classes.jsfaq__section__description}
              dangerouslySetInnerHTML={{ __html: sectionDescription }}
            />
          ) : null}
        </header>
        <div className={classes.jsfaq__section__items}>
          {/* Render all FAQ items within this section */}
          <RenderChildren />
        </div>
      </section>
    );
  },
);
