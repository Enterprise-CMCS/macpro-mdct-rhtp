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
      type: ElementType.Paragraph,
      id: "general-information-instructions",
      text: "Instructions go here that need to be seen at all times. Provide details and context to help the user complete this page.",
    },
    {
      type: ElementType.Accordion,
      id: "general-information-accordion-instructions",
      label: "Instructions",
      value: "<b>More details coming soon.</b>",
    },
    {
      id: "aor-name",
      type: ElementType.Textbox,
      label: "Authorized Organizational Representative (AOR)",
      required: true,
      helperText:
        "Enter person's name or a position title for CMS to contact with questions about this report.",
    },
    {
      type: ElementType.Textbox,
      id: "aor-email",
      label: "Authorized Organizational Representative (AOR) Contact email",
      required: true,
      helperText:
        "Enter email address. Department or program-wide email addresses ok.",
    },
    {
      id: "pipd-name",
      type: ElementType.Textbox,
      label: "Principal Investigator or Program Director",
      required: true,
      helperText:
        "Enter person's name or a position title for CMS to contact with questions about this report.",
    },
    {
      type: ElementType.Textbox,
      id: "pipd-email",
      label: "Principal Investigator or Program Director Contact email",
      required: true,
      helperText:
        "Enter email address. Department or program-wide email addresses ok.",
    },
  ],
};
