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
