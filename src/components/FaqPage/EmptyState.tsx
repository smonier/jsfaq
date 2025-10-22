import classes from "../../styles/faq.module.css";

type EmptyStateProps = {
  message: string;
};

const EmptyState = ({ message }: EmptyStateProps) => (
  <div className={classes["jsfaq-empty"]} data-faq-empty hidden>
    {message}
  </div>
);

export default EmptyState;
