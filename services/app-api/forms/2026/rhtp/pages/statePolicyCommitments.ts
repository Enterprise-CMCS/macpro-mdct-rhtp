import { ElementType, FormPageTemplate, PageType } from "@rhtp/shared";

export const statePolicyCommitments: FormPageTemplate = {
  id: "state-policy-commitments",
  title: "State Policy Commitments",
  type: PageType.Standard,
  sidebar: true,
  elements: [
    {
      type: ElementType.Header,
      id: "state-policy-commitments-header",
      text: "State Policy Commitments",
    },
    {
      type: ElementType.AccordionGroup,
      id: "state-policy-commitments-group",
      accordions: [
        {
          label: "B.2 Presidental Fitness Test",
          children: [
            {
              id: "test-comment",
              type: ElementType.Textbox,
              label: "Testing textbox",
              helperText: "This is the hint text",
              required: true,
            },
          ],
        },
        {
          label: "B.3 SNAP Food Restriction Waiver Policy",
          children: [
            {
              type: ElementType.Dropdown,
              id: "curr-status",
              label: "Current Status",
              helperText: "This is the hint text",
              options: [
                { label: "Option 1", value: "op-1" },
                { label: "Option 2", value: "op-2" },
              ],
              required: true,
            },
            {
              type: ElementType.AttachmentArea,
              id: "upload-area",
              label: "Supporting Evidence: Attachments",
              required: false,
            },
            {
              id: "optional-comment",
              type: ElementType.TextAreaField,
              label: "Optional Comments/Notes",
              helperText: "This is the hint text",
              required: true,
            },
          ],
        },
        {
          label: "B.4 Nutrition Continuing Medical Education",
          children: [
            {
              id: "optional-comment",
              type: ElementType.TextAreaField,
              label: "Optional Comments/Notes",
              helperText: "This is the hint text",
              required: true,
            },
          ],
        },
      ],
      required: true,
    },
  ],
};
