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
      id: "aor-name",
      type: ElementType.Textbox,
      label: "Authorized Organizational Representative (AOR)",
      required: true,
      helperText:
        "Enter the name or position title for CMS to contact with questions about this report.",
      quarterly: true,
    },
    {
      type: ElementType.Textbox,
      id: "aor-email",
      label: "Authorized Organizational Representative (AOR) Contact email",
      required: true,
      helperText: "A department or program-wide email address is acceptable.",
      quarterly: true,
    },
    {
      id: "pipd-name",
      type: ElementType.Textbox,
      label: "Principal Investigator or Program Director",
      required: true,
      helperText:
        "Enter the name or position title for CMS to contact with questions about this report.",
      quarterly: true,
    },
    {
      type: ElementType.Textbox,
      id: "pipd-email",
      label: "Principal Investigator or Program Director Contact email",
      required: true,
      helperText: "A department or program-wide email address is acceptable.",
      quarterly: true,
    },
  ],
};
