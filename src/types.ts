export type FaqStrings = {
  searchPlaceholder: string;
  clearFilters: string;
  featured: string;
  featuredFirst: string;
  tagsLabel: string;
  copyLink: string;
  copied: string;
  copyLinkSuccess: string;
  copyLinkError: string;
  questionsHeading: string;
  noResults: string;
  expandAll: string;
  collapseAll: string;
};

export type FaqItem = {
  uuid: string;
  question: string;
  answerHtml: string;
  answerText?: string;
  tags?: string[];
  isFeatured?: boolean;
};

export type FaqSection = {
  uuid: string;
  sectionTitle: string;
  sectionDescription?: string;
  items: FaqItem[];
};

export type FaqPage = {
  uuid: string;
  title: string;
  introHtml?: string;
  sections: FaqSection[];
  items: FaqItem[];
};

export type FaqInitialProps = {
  page: FaqPage;
  tags: string[];
  language: string | null;
  featuredFirstDefault: boolean;
  strings: FaqStrings;
};

export type SchemaOrgFaq = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  "mainEntity": Array<{
    "@type": "Question";
    "name": string;
    "acceptedAnswer": {
      "@type": "Answer";
      "text": string;
    };
  }>;
};
