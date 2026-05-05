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
      text: "<p>The list below includes initiatives you have previously submitted to CMS. Select <b>Edit</b> for each initiative to report on its progress.</p>",
    },
    {
      type: ElementType.InitiativesTable,
      id: "initiatives-table",
    },
  ],
};
