import { jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import FaqItem from "./FaqItem";
import classes from "../../styles/faq.module.css";
import RichText from "../../server/RichText";
import { getString, getTags, idPrefixFor, placeItem } from "../../server/nodes";

jahiaComponent(
  {
    nodeType: "jsfaqnt:faqItem",
    componentType: "view",
    displayName: "FAQ Item",
  },
  (_props, { currentNode, currentResource, renderContext }) => {
    const { t } = useTranslation();
    const uuid = String(currentNode.getIdentifier());
    const question = getString(currentNode, "question") || getString(currentNode, "jcr:title");
    const placement = placeItem(currentNode);
    try {
      // The question level follows the headings above it: re-render when they change.
      placement.dependencies.forEach((path) => currentResource.getDependencies().add(path));
    } catch {
      // the fragment then only follows its own node
    }
    const isFeatured = (() => {
      try {
        return (
          currentNode.hasProperty("isFeatured") &&
          currentNode.getProperty("isFeatured").getBoolean()
        );
      } catch {
        return false;
      }
    })();

    return (
      <FaqItem
        uuid={uuid}
        question={question}
        answer={
          <RichText
            className={classes["jsfaq-item__answer-content"]}
            html={getString(currentNode, "answer")}
            headingLevel={placement.level + 1}
            idPrefix={idPrefixFor(currentNode, "a")}
          />
        }
        tags={getTags(currentNode)}
        isFeatured={isFeatured}
        level={placement.level}
        interactive={!renderContext.isEditMode()}
        strings={{ featured: t("featured"), itemTags: t("itemTags") }}
      />
    );
  },
);
