import { ElementType, FormPageTemplate, PageType } from "@rhtp/shared";

export const generalInformation: FormPageTemplate = {
  id: "general-information",
  title: "General Information",
  type: PageType.Standard,
  sidebar: true,
  elements: [
    {
      type: ElementType.Header,
      id: "general-information-header",
      text: "General Information",
    },
    {
      id: "contact-name",
      type: ElementType.Textbox,
      label: "Contact name",
      quarterly: false,
      required: true,
      helperText:
        "Enter a person's name or a position title for CMS to contact with questions about this report.",
    },
    {
      type: ElementType.Textbox,
      id: "contact-email",
      label: "Contact email address",
      quarterly: true,
      required: true,
      helperText:
        "Enter an email address for the person or position above. Department or program-wide email addresses are allowed.",
    },
  ],
};
