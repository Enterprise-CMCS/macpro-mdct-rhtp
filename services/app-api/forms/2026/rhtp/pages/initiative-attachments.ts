import { ElementType, FormPageTemplate, PageType } from "@rhtp/shared";

export const initiativeAttachments: FormPageTemplate = {
  id: "initiative-attachments",
  title: "Initiative Attachments",
  type: PageType.Standard,
  sidebar: true,
  elements: [
    {
      type: ElementType.Header,
      id: "initiatives-header",
      text: "Initiative Attachments",
    },
    {
      type: ElementType.Paragraph,
      id: "initiatives-instructions",
      text: "Instructions go here that need to be seen at all times. Provide details and context to help the user complete this page.",
    },
    {
      type: ElementType.AttachmentTable,
      id: "initiative-attachments-table",
    },
  ],
};
