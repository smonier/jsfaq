import classes from "../../styles/faq.module.css";

type FeaturedBadgeProps = {
  label: string;
};

const FeaturedBadge = ({ label }: FeaturedBadgeProps) => (
  <span className={classes["jsfaq-badge"]}>{label}</span>
);

export default FeaturedBadge;
