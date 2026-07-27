import {
  ElementType,
  FormPageTemplate,
  PageType,
  ObligatedAndSpentFundsAttachmentTemplate,
} from "@rhtp/shared";

const ObligatedAndSpentFundsAttachmentElement: ObligatedAndSpentFundsAttachmentTemplate =
  {
    type: ElementType.ObligatedAndSpentFundsAttachment,
    id: "obligated-and-spent-funds-attachment",
    label: "Uploaded Attachment",
    required: true,
  };

export const obligatedAndSpentFunds: FormPageTemplate = {
  id: "obligated-and-spent-funds",
  title: "Obligated and Spent Funds",
  type: PageType.Standard,
  sidebar: true,
  elements: [
    {
      type: ElementType.Header,
      id: "obligated-and-spent-funds-header",
      text: "Obligated and Spent Funds",
    },
    {
      type: ElementType.Paragraph,
      id: "obligated-and-spent-funds-main-instructions",
      text: "Select “Add Obligated and Spent Funds” option below to attach the Obligated and Spent Funds file for this reporting period.",
    },
    ObligatedAndSpentFundsAttachmentElement,
  ],
};
