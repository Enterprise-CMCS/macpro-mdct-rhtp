import {
  DateField,
  DropdownField,
  ListInput,
  RadioField,
  TextAreaField,
  TextField,
} from "components/fields";
import { Accordion, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import {
  AccordionItem,
  StatusTableElement,
  StatusAlert,
  CheckboxField,
  AttachmentArea,
  InitiativesTable,
  TableCheckpoint,
  AccordionGroup,
  ActionTable,
  AttachmentTable,
} from "components";
import {
  ButtonLinkElement,
  DividerElement,
  HeaderElement,
  ParagraphElement,
  SubHeaderElement,
} from "components/report/Elements";
import {
  AlertTypes,
  AttachmentStatus,
  ElementType,
  HeaderIcon,
  NumberFieldTemplate,
  PageElement,
} from "@rhtp/shared";
import { ReactNode } from "react";
import { ExportedReportWrapper } from "components/export/ExportedReportWrapper";
import {
  textboxSection,
  textAreaSection,
  numberFieldSection,
  radioFieldSection,
  listFieldSection,
  attachmentAreaSection,
  tableCheckpointSection,
  accordionGroupSection,
  obligatedAndSpentFundsSection,
  actionTableSection,
} from "./pdfElementSectionHelpers";
import { formatMonthDayYear } from "utils";
import { SubmissionParagraph } from "components/report/SubmissionParagraph";
import { ObligatedAndSpentFundsAttachmentElement } from "components/report/ObligatedAndSpentFundsAttachment";
import { RequestFeedbackButton } from "components/report/RequestFeedbackButton";

const logNewElement = (el: Partial<PageElement>) => console.log("Updated:", el);

export const elementObject: {
  [key: string]: {
    description: string;
    variants: ReactNode[];
    pdfVariants: ReactNode[];
    id?: string;
  };
} = {
  [ElementType.Header]: {
    description: "Big text at the top of the page",
    id: "id-header",
    variants: [
      <HeaderElement
        element={{
          type: ElementType.Header,
          id: "id-header",
          text: "HeaderElement",
        }}
      />,
      <HeaderElement
        element={{
          type: ElementType.Header,
          id: "id-header-with-icon",
          text: "HeaderElement with Icon",
          icon: HeaderIcon.Check,
        }}
      />,
    ],
    pdfVariants: [
      <HeaderElement
        element={{
          type: ElementType.Header,
          id: "id-header",
          text: "HeaderElement",
        }}
      />,
    ],
  },
  [ElementType.SubHeader]: {
    description: "This is a subheader",
    id: "id-subheader",
    variants: [
      <SubHeaderElement
        element={{
          type: ElementType.SubHeader,
          id: "id-subheader",
          text: "SubHeaderElement",
        }}
      />,
    ],
    pdfVariants: [
      <SubHeaderElement
        element={{
          type: ElementType.SubHeader,
          id: "id-subheader",
          text: "SubHeaderElement",
        }}
      />,
    ],
  },
  [ElementType.Textbox]: {
    description: "A field for entering text",
    id: "id-textfield",
    variants: [
      <TextField
        updateElement={logNewElement}
        element={{
          type: ElementType.Textbox,
          id: "id-textfield",
          label: "TextField",
          required: false,
        }}
      />,
    ],
    pdfVariants: [<ExportedReportWrapper section={textboxSection} />],
  },
  [ElementType.TextAreaField]: {
    description: "A field for entering text",
    id: "id-textareafield",
    variants: [
      <TextAreaField
        updateElement={logNewElement}
        element={{
          type: ElementType.TextAreaField,
          id: "id-textareafield",
          label: "TextAreaField",
          required: true,
        }}
      />,
    ],
    pdfVariants: [<ExportedReportWrapper section={textAreaSection} />],
  },
  [ElementType.Paragraph]: {
    description: "A paragraph of text for content.",
    id: "id-paragraph",
    variants: [
      <ParagraphElement
        element={{
          type: ElementType.Paragraph,
          id: "id-paragraph",
          text: "Useful for explanations or instructions.. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        }}
      />,
    ],
    pdfVariants: ["Paragraph currently not used in PDFs"],
  },
  [ElementType.Divider]: {
    description: "A horizontal line to separate content",
    id: "id-divider",
    variants: [
      <DividerElement
        element={{
          type: ElementType.Divider,
          id: "id-divider",
        }}
      />,
    ],
    pdfVariants: ["Divider currently not used in PDFs"],
  },
  [ElementType.Accordion]: {
    description: "A collapsible section for content",
    id: "id-accordion",
    variants: [
      <Accordion allowToggle={true} defaultIndex={[-1]}>
        <AccordionItem label="Accordion Item 1">
          I am the content of the first accordion item.
        </AccordionItem>
        <AccordionItem label="Accordion Item 2">
          I am the content of the second accordion item.
        </AccordionItem>
        <AccordionItem label="Accordion Item 3">
          I am the content of the third accordion item.
        </AccordionItem>
      </Accordion>,
    ],
    pdfVariants: ["Accordion currently not used in PDFs"],
  },
  [ElementType.Dropdown]: {
    description: "A dropdown field for selecting options",
    id: "id-dropdown-field",
    variants: [
      <DropdownField
        updateElement={logNewElement}
        element={{
          type: ElementType.Dropdown,
          id: "id-dropdown",
          label: "DropdownField",
          required: true,
          options: [
            { value: "dropdown option 1", label: "dropdown option 1" },
            { value: "dropdown option 2", label: "dropdown option 2" },
            { value: "dropdown option 3", label: "dropdown option 3" },
          ],
        }}
      />,
    ],
    pdfVariants: ["Dropdown currently not used in PDFs"],
  },
  [ElementType.Radio]: {
    description: "A radio button field for selecting one option",
    id: "id-radio-field",
    variants: [
      <RadioField
        updateElement={logNewElement}
        element={{
          type: ElementType.Radio,
          id: "id-radio",
          label: "RadioField",
          required: true,
          choices: [
            { value: "radio option 1", label: "radio option 1" },
            { value: "radio option 2", label: "radio option 2" },
            { value: "radio option 3", label: "radio option 3" },
          ],
        }}
      />,
    ],
    pdfVariants: [<ExportedReportWrapper section={radioFieldSection} />],
  },
  [ElementType.Date]: {
    description: "A field for selecting a date",
    id: "id-date-field",
    variants: [
      <DateField
        updateElement={logNewElement}
        element={{
          type: ElementType.Date,
          id: "id-date-field",
          label: "DateField",
          helperText: "DateFieldElement is used to select a date.",
          required: true,
        }}
      />,
    ],
    pdfVariants: [
      <Table variant={"reportDetails"}>
        <Thead>
          <Tr>
            <Th>Reporting year</Th>
            <Th>Last edited</Th>
            <Th>Edited by</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>{2025}</Td>
            <Td>{formatMonthDayYear(1757897305331)}</Td>
            <Td>{"test user"}</Td>
            <Td>{"In progress"}</Td>
          </Tr>
        </Tbody>
      </Table>,
    ],
  },
  [ElementType.NumberField]: {
    description: "A field for entering numbers",
    id: "id-number-field",
    variants: [
      <TextField
        updateElement={logNewElement}
        element={
          {
            type: ElementType.NumberField,
            id: "id-number-field",
            label: "Enter a number",
            helperText: "Helper text is optional",
            required: false,
          } as NumberFieldTemplate
        }
      />,
      <TextField
        updateElement={logNewElement}
        element={
          {
            type: ElementType.NumberField,
            id: "id-number-field-required",
            label: "NumberField with required validation",
            helperText: "This field is required.",
            required: true,
          } as NumberFieldTemplate
        }
      />,
    ],
    pdfVariants: [<ExportedReportWrapper section={numberFieldSection} />],
  },
  [ElementType.ButtonLink]: {
    description: "A link styled as a button",
    id: "id-button-link",
    variants: [
      <ButtonLinkElement
        element={{
          type: ElementType.ButtonLink,
          id: "id-button-link",
          to: "page-link",
          label: "Button Link Label",
        }}
      />,
    ],
    pdfVariants: ["Buttonlink currently not used in PDFs"],
  },
  [ElementType.StatusTable]: {
    description: "A table for displaying statuses",
    id: "id-status-table",
    variants: [<StatusTableElement />],
    pdfVariants: ["StatusTable currently not used in PDFs"],
  },
  [ElementType.StatusAlert]: {
    description: "Different Alert Types",
    id: "id-status-alert",
    variants: [
      <StatusAlert
        element={{
          type: ElementType.StatusAlert,
          id: "id-status",
          title: "Status Title",
          text: "AlertTypes.SUCCESS",
          status: AlertTypes.SUCCESS,
        }}
      />,
      <StatusAlert
        element={{
          type: ElementType.StatusAlert,
          id: "id-status",
          title: "Status Title",
          text: "AlertTypes.ERROR",
          status: AlertTypes.ERROR,
        }}
      />,
      <StatusAlert
        element={{
          type: ElementType.StatusAlert,
          id: "id-status",
          title: "Status Title",
          text: "AlertTypes.INFO",
          status: AlertTypes.INFO,
        }}
      />,
      <StatusAlert
        element={{
          type: ElementType.StatusAlert,
          id: "id-status",
          title: "Status Title",
          text: "AlertTypes.WARNING",
          status: AlertTypes.WARNING,
        }}
      />,
    ],
    pdfVariants: ["StatusAlert currently not used in PDFs"],
  },
  [ElementType.SubmissionParagraph]: {
    description: "Submission Paragraph",
    id: "id-submission-paragraph",
    variants: [<SubmissionParagraph />],
    pdfVariants: ["SubmissionParagraph currently not used in PDFs"],
  },
  [ElementType.Checkbox]: {
    description: "A checkbox field for selecting options",
    id: "id-checkbox",
    variants: [
      <CheckboxField
        updateElement={logNewElement}
        element={{
          type: ElementType.Checkbox,
          id: "id-checkbox",
          label: "CheckboxField",
          required: true,
          choices: [
            { value: "checkbox option 1", label: "checkbox option 1" },
            { value: "checkbox option 2", label: "checkbox option 2" },
            { value: "checkbox option 3", label: "checkbox option 3" },
          ],
        }}
      />,
    ],
    pdfVariants: ["Checkbox currently not used in PDFs"],
  },
  [ElementType.ListInput]: {
    description: "A field for adding a series of inputs",
    id: "id-listinput",
    variants: [
      <ListInput
        updateElement={logNewElement}
        element={{
          type: ElementType.ListInput,
          id: "id-listinput",
          buttonText: "Add list input",
          required: true,
          fieldLabel: "input",
          label: "List Input",
        }}
      ></ListInput>,
    ],
    pdfVariants: [<ExportedReportWrapper section={listFieldSection} />],
  },
  [ElementType.AttachmentArea]: {
    description: "",
    id: "id-attachment",
    variants: [
      <AttachmentArea
        updateElement={logNewElement}
        element={{
          type: ElementType.AttachmentArea,
          id: "id-attachment",
          label: "label",
          required: true,
        }}
      ></AttachmentArea>,
    ],
    pdfVariants: [<ExportedReportWrapper section={attachmentAreaSection} />],
  },
  [ElementType.TableCheckpoint]: {
    description: "",
    id: "id-table-checkpoint",
    variants: [
      <TableCheckpoint
        element={{
          type: ElementType.TableCheckpoint,
          id: "id-table-checkpoint",
          required: true,
        }}
        updateElement={logNewElement}
      ></TableCheckpoint>,
    ],
    pdfVariants: [<ExportedReportWrapper section={tableCheckpointSection} />],
  },
  [ElementType.AccordionGroup]: {
    description: "",
    id: "id-accordion-group",
    variants: [
      <AccordionGroup
        element={{
          type: ElementType.AccordionGroup,
          id: "id-accordion-group",
          accordions: [
            {
              label: "Accordiong Group 1",
              elements: [
                {
                  type: ElementType.Textbox,
                  id: "",
                  label: "",
                  required: false,
                },
              ],
            },
            {
              label: "Accordiong Group 2",
              elements: [
                {
                  type: ElementType.Textbox,
                  id: "",
                  label: "",
                  required: false,
                },
              ],
            },
          ],
          required: true,
        }}
        updateElement={logNewElement}
      ></AccordionGroup>,
    ],
    pdfVariants: [<ExportedReportWrapper section={accordionGroupSection} />],
  },
  [ElementType.ObligatedAndSpentFundsAttachment]: {
    description: "",
    id: "id-funds-attachment",
    variants: [
      <ObligatedAndSpentFundsAttachmentElement
        element={{
          type: ElementType.ObligatedAndSpentFundsAttachment,
          id: "id-obligated-spent-funds",
          label: "Obligated And Spend",
          answer: [],
          required: false,
        }}
        updateElement={logNewElement}
      ></ObligatedAndSpentFundsAttachmentElement>,
      <ObligatedAndSpentFundsAttachmentElement
        element={{
          type: ElementType.ObligatedAndSpentFundsAttachment,
          id: "id-obligated-spent-funds",
          label: "Filled Obligated And Spent Funds",
          answer: [
            {
              fileId: "mock-file-id",
              name: "mock file",
              size: 100,
            },
          ],
          required: false,
        }}
        updateElement={logNewElement}
      ></ObligatedAndSpentFundsAttachmentElement>,
    ],
    pdfVariants: [
      <ExportedReportWrapper section={obligatedAndSpentFundsSection} />,
    ],
  },
  [ElementType.ActionTable]: {
    description: "",
    id: "id-action-table",
    variants: [
      <ActionTable
        element={{
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
              { id: "row-1", value: "2" },
              { id: "row-2", value: "" },
              { id: "row-3", value: "" },
            ],
          ],
          required: true,
        }}
        updateElement={logNewElement}
      ></ActionTable>,
    ],
    pdfVariants: [<ExportedReportWrapper section={actionTableSection} />],
  },
  [ElementType.AttachmentTable]: {
    description: "",
    id: "id-attachment-table",
    variants: [
      <AttachmentTable
        element={{
          type: ElementType.AttachmentTable,
          id: "id-attachment-table",
          answer: [
            {
              checkpoint: "planning-2",
              initiatives: ["init-1"],
              attachment: {
                name: "attachment name",
                size: 100,
                fileId: "mock-file-id",
              },
              status: AttachmentStatus.PENDING_REVIEW,
              canDelete: true,
            },
          ],
        }}
        updateElement={logNewElement}
      ></AttachmentTable>,
    ],
    pdfVariants: ["Attachment Table currently not used in PDFs"],
  },
  [ElementType.RequestFeedbackButton]: {
    description: "",
    id: "id-submit-for-review",
    variants: [<RequestFeedbackButton></RequestFeedbackButton>],
    pdfVariants: ["Request Feedback button currently not used in PDFs"],
  },
  [ElementType.InitiativesTable]: {
    description: "",
    id: "id-initiative-table",
    variants: [
      <InitiativesTable
        element={{
          id: "id-initiative-table",
          type: ElementType.InitiativesTable,
          required: false,
          quarterly: undefined,
          disabled: undefined,
        }}
      ></InitiativesTable>,
    ],
    pdfVariants: ["Initiative Table currently not used in PDFs"],
  },
};
