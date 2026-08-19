import {
  ElementType,
  FormPageTemplate,
  PageType,
  TableCheckpointTemplate,
} from "@rhtp/shared";

export const textboxSection: FormPageTemplate = {
  id: "mock-textbox-id",
  title: "mock-textbox-title",
  type: PageType.Standard,
  elements: [
    {
      type: ElementType.Textbox,
      id: "Textbox",
      label: "Textbox",
      helperText: "Information to help user fill out textbox",
      answer: "sample text",
      required: true,
    },
  ],
};

export const textAreaSection: FormPageTemplate = {
  id: "mock-textarea-id",
  title: "mock-textarea-title",
  type: PageType.Standard,
  elements: [
    {
      type: ElementType.TextAreaField,
      id: "textarea",
      label: "TextArea",
      helperText: "Information to help user fill out textbox",
      answer: "sample text",
      required: true,
    },
  ],
};

export const numberFieldSection: FormPageTemplate = {
  id: "mock-numberfield-id",
  title: "mock-number-title",
  type: PageType.Standard,
  elements: [
    {
      type: ElementType.Textbox,
      id: "numberField",
      label: "NumberField",
      helperText: "Information to help user fill out number field",
      answer: "5",
      required: true,
    },
  ],
};

export const dateFieldSection: FormPageTemplate = {
  id: "mock-date-id",
  title: "mock-date-title",
  type: PageType.Standard,
  elements: [
    {
      type: ElementType.Date,
      id: "date",
      label: "Reporting period start date",
      helperText:
        "What is the reporting period Start Date applicable to the results?",
      required: true,
    },
  ],
};

export const radioFieldSection: FormPageTemplate = {
  id: "mock-radio-id",
  title: "mock-radio-title",
  type: PageType.Standard,
  elements: [
    {
      type: ElementType.Radio,
      id: "id-radio",
      label: "RadioField",
      choices: [
        { value: "radio option 1", label: "radio option 1" },
        { value: "radio option 2", label: "radio option 2" },
        { value: "radio option 3", label: "radio option 3" },
      ],
      answer: "radio option 1",
      required: true,
    },
  ],
};

export const listFieldSection: FormPageTemplate = {
  id: "mock-list-id",
  title: "mock-list-title",
  type: PageType.Standard,
  elements: [
    {
      type: ElementType.ListInput,
      id: "id-listinput",
      buttonText: "Add list input",
      required: true,
      fieldLabel: "input",
      label: "List Input",
      answer: ["list input 1"],
    },
  ],
};

export const attachmentAreaSection: FormPageTemplate = {
  id: "mock-attachment-area-id",
  title: "mock-attachment-area-title",
  type: PageType.Standard,
  elements: [
    {
      type: ElementType.AttachmentArea,
      id: "id-attachment",
      label: "label",
      required: true,
    },
  ],
};

export const tableCheckpointSection: FormPageTemplate = {
  id: "mock-table-checkpoint-id",
  title: "mock-table-checkpoint-title",
  type: PageType.Standard,
  elements: [
    {
      type: ElementType.TableCheckpoint,
      id: "id-table-checkpoint",
      required: true,
      answer: [
        { id: "planning-1", checked: true },
        { id: "midway-imp-1", checked: true },
      ],
      initId: "1",
    } as TableCheckpointTemplate & { initId: string },
  ],
};

export const accordionGroupSection: FormPageTemplate = {
  id: "mock-accordion-group-id",
  title: "mock-accordion-group-title",
  type: PageType.Standard,
  elements: [
    {
      type: ElementType.AccordionGroup,
      id: "id-accordion-group",
      accordions: [
        {
          label: "Accordiong Group 1",
          elements: [
            {
              type: ElementType.Textbox,
              id: "mock-textbox",
              label: "Mock Textbox",
              required: false,
              answer: "answer",
            },
          ],
        },
      ],
      required: true,
    },
  ],
};

export const obligatedAndSpentFundsSection: FormPageTemplate = {
  id: "mock-obligated-spent-fund-id",
  title: "mock-obligated-spent-fund-title",
  type: PageType.Standard,
  elements: [
    {
      type: ElementType.ObligatedAndSpentFundsAttachment,
      id: "id-obligated-spent-funds",
      label: "Obligated And Spend",
      answer: [],
      required: false,
    },
  ],
};

export const actionTableSection: FormPageTemplate = {
  id: "mock-action-table-id",
  title: "mock-action-table-title",
  type: PageType.Standard,
  elements: [
    {
      type: ElementType.ActionTable,
      id: "id-action-table",
      label: "Action Table",
      heading: "Action Table",
      helperText: "hint text",
      modal: {
        title: "Modal",
        elements: [],
      },
      rows: [
        {
          header: "Text Field",
          id: "row-1",
          type: ElementType.Paragraph,
        },
        {
          header: "Textbox Field",
          id: "row-2",
          type: ElementType.Textbox,
        },
        {
          header: "Date Field",
          id: "row-3",
          type: ElementType.Date,
        },
      ],
      answer: [
        [
          { id: "row-1", value: "1" },
          { id: "row-2", value: "textbox 1" },
          { id: "row-3", value: "01/01/2021" },
        ],
        [
          { id: "row-1", value: "2" },
          { id: "row-2", value: "textbox 2" },
          { id: "row-3", value: "02/02/2022" },
        ],
      ],
      required: true,
    },
  ],
};
