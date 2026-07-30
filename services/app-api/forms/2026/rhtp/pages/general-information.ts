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
        "Enter the name for CMS to contact with questions about this report.",
      quarterly: true,
    },
    {
      type: ElementType.Textbox,
      id: "aor-email",
      label: "Authorized Organizational Representative (AOR) Contact email",
      required: true,
      helperText: "Enter the email address for the AOR.",
      quarterly: true,
    },
    {
      id: "pipd-name",
      type: ElementType.Textbox,
      label: "Principal Investigator or Program Director",
      required: true,
      helperText:
        "Enter the name for CMS to contact with questions about this report.",
      quarterly: true,
    },
    {
      type: ElementType.Textbox,
      id: "pipd-email",
      label: "Principal Investigator or Program Director Contact email",
      required: true,
      helperText: "Enter the email address for the PI/PD.",
      quarterly: true,
    },
    {
      type: ElementType.Textbox,
      id: "poc-noa",
      label: "Point of Contact (POC) listed in NoA",
      required: false,
      helperText: "Optionally added and approved by CMS.",
      quarterly: true,
    },
    {
      type: ElementType.Textbox,
      id: "poc-email",
      label: "Point of Contact (POC) email",
      required: false,
      helperText:
        "Enter the email address for the Additional Point of Contact listed in the NoA.",
      quarterly: true,
    },
  ],
};
