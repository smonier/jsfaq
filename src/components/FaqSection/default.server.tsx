import { jahiaComponent, RenderChildren } from "@jahia/javascript-modules-library";
import classes from "../../styles/faq.module.css";
import RichText from "../../server/RichText";
import { getString, idPrefixFor, placeSection } from "../../server/nodes";

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

jahiaComponent(
  {
    nodeType: "jsfaqnt:faqSection",
    componentType: "view",
    displayName: "FAQ Section",
  },
  (_props, { currentNode, currentResource }) => {
    const uuid = String(currentNode.getIdentifier());
    const title = getString(currentNode, "sectionTitle") || getString(currentNode, "jcr:title");
    const placement = placeSection(currentNode);
    try {
      // The section level follows the FAQ title: re-render when it changes.
      placement.dependencies.forEach((path) => currentResource.getDependencies().add(path));
    } catch {
      // the fragment then only follows its own node
    }
    const Heading = `h${placement.level}` as HeadingTag;
    const headingId = `section-${uuid}`;

    return (
      <section className={classes.jsfaq__section} data-faq-section={uuid}>
        {title ? (
          <header className={classes.jsfaq__section__header}>
            <Heading id={headingId} className={classes.jsfaq__section__title}>
              {title}
            </Heading>
            <RichText
              className={classes.jsfaq__section__description}
              html={getString(currentNode, "sectionDescription")}
              headingLevel={placement.level + 1}
              idPrefix={idPrefixFor(currentNode, "s")}
            />
          </header>
        ) : (
          <RichText
            className={classes.jsfaq__section__description}
            html={getString(currentNode, "sectionDescription")}
            headingLevel={placement.level}
            idPrefix={idPrefixFor(currentNode, "s")}
          />
        )}
        <div className={classes.jsfaq__section__items}>
          <RenderChildren />
        </div>
      </section>
    );
  },
);
