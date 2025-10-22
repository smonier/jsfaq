import type { ChangeEvent, FormEvent } from "react";
import classes from "../../styles/faq.module.css";

type FaqSearchProps = {
  searchTerm: string;
  featuredFirst: boolean;
  hasActiveFilters: boolean;
  onSearchChange?: (value: string) => void;
  onClearFilters?: () => void;
  onFeaturedFirstChange?: (value: boolean) => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  strings: {
    searchPlaceholder: string;
    clearFilters: string;
    featuredFirst: string;
    expandAll: string;
    collapseAll: string;
  };
};

const noop = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
};

const FaqSearch = ({
  searchTerm,
  featuredFirst,
  hasActiveFilters,
  onSearchChange,
  onClearFilters,
  onFeaturedFirstChange,
  onExpandAll,
  onCollapseAll,
  strings,
}: FaqSearchProps) => (
  <form className={classes["jsfaq-search"]} role="search" data-island="FaqSearch" onSubmit={noop}>
    <label className={classes["jsfaq-search__field"]}>
      <span className={classes["jsfaq-visually-hidden"]}>{strings.searchPlaceholder}</span>
      <input
        type="search"
        name="faq-search"
        value={searchTerm}
        placeholder={strings.searchPlaceholder}
        autoComplete="off"
        data-faq-search
        onChange={
          onSearchChange
            ? (event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value)
            : undefined
        }
      />
    </label>
    <div className={classes["jsfaq-search__actions"]}>
      <div className={classes["jsfaq-search__toggles"]}>
        <button
          type="button"
          className={`${classes["jsfaq-button"]} ${classes["jsfaq-button--ghost"]}`}
          data-faq-expand-all
          onClick={onExpandAll}
        >
          {strings.expandAll}
        </button>
        <button
          type="button"
          className={`${classes["jsfaq-button"]} ${classes["jsfaq-button--ghost"]}`}
          data-faq-collapse-all
          onClick={onCollapseAll}
        >
          {strings.collapseAll}
        </button>
      </div>
      <button
        type="button"
        data-faq-clear
        className={`${classes["jsfaq-button"]} ${classes["jsfaq-button--ghost"]}`}
        onClick={onClearFilters}
        disabled={!hasActiveFilters}
      >
        {strings.clearFilters}
      </button>
      <label className={classes["jsfaq-search__toggle"]}>
        <input
          type="checkbox"
          data-faq-featured
          checked={featuredFirst}
          onChange={
            onFeaturedFirstChange
              ? (event: ChangeEvent<HTMLInputElement>) =>
                  onFeaturedFirstChange(event.target.checked)
              : undefined
          }
        />
        <span>{strings.featuredFirst}</span>
      </label>
    </div>
  </form>
);

export default FaqSearch;
