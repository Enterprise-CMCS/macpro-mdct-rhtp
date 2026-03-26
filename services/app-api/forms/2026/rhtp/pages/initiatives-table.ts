import { ElementType, FormPageTemplate, PageType } from "@rhtp/shared";

export const initiativesTable: FormPageTemplate = {
  id: "initiatives",
  title: "Initiatives",
  type: PageType.Standard,
  sidebar: true,
  elements: [
    {
      type: ElementType.Header,
      id: "initiatives-header",
      text: "Initiatives",
    },
    {
      type: ElementType.Paragraph,
      id: "initiatives-instructions",
      text: "Instructions go here that need to be seen at all times. Provide details and context to help the user complete this page.",
    },
    {
      type: ElementType.Accordion,
      id: "initiatives-accordion-instructions",
      label: "More details",
      value: "<b>More details coming soon.</b>",
    },
    {
      type: ElementType.InitiativesTable,
      id: "initiatives-table",
    },
  ],
};
