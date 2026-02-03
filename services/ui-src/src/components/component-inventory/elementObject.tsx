import {
  DateField,
  DropdownField,
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
  ElementType,
  HeaderIcon,
  NumberFieldTemplate,
  PageElement,
} from "types";
import { ReactNode } from "react";
import { ExportedReportWrapper } from "components/export/ExportedReportWrapper";
import {
  textboxSection,
  textAreaSection,
  numberFieldSection,
  radioFieldSection,
} from "./pdfElementSectionHelpers";
import { formatMonthDayYear } from "utils";
import { SubmissionParagraph } from "components/report/SubmissionParagraph";

// eslint-disable-next-line no-console
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
          label: "Button Link Label",
        }}
      />,
    ],
    pdfVariants: ["Buttonlink currently not used in PDFs"],
  },
  [ElementType.StatusTable]: {
    description: "A table for displaying measure status",
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
          id: "measure-rates",
          title: "Status Title",
          text: "AlertTypes.SUCCESS",
          status: AlertTypes.SUCCESS,
        }}
      />,
      <StatusAlert
        element={{
          type: ElementType.StatusAlert,
          id: "measure-rates",
          title: "Status Title",
          text: "AlertTypes.ERROR",
          status: AlertTypes.ERROR,
        }}
      />,
      <StatusAlert
        element={{
          type: ElementType.StatusAlert,
          id: "measure-rates",
          title: "Status Title",
          text: "AlertTypes.INFO",
          status: AlertTypes.INFO,
        }}
      />,
      <StatusAlert
        element={{
          type: ElementType.StatusAlert,
          id: "measure-rates",
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
};
