import {
  ElementType,
  FormPageTemplate,
  PageType,
  UseOfFundsAttachmentTemplate,
} from "@rhtp/shared";

const UseOfFundsAttachmentElement: UseOfFundsAttachmentTemplate = {
  type: ElementType.UseOfFundsAttachment,
  id: "use-of-funds-attachment",
  required: true,
};

export const useOfFunds: FormPageTemplate = {
  id: "use-of-funds",
  title: "Use of Funds",
  type: PageType.Standard,
  sidebar: true,
  elements: [
    {
      type: ElementType.Header,
      id: "use-of-funds-header",
      text: "Use of Funds",
    },
    {
      type: ElementType.Paragraph,
      id: "use-of-funds-main-instructions",
      text: "Select “Add Use of Funds” option below to attach the Use of Funds file for this reporting period.",
    },
    UseOfFundsAttachmentElement,
  ],
};
