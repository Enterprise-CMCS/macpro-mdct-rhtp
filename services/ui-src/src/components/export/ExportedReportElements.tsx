import { Heading } from "@chakra-ui/react";
import { ElementType, PageElement } from "@rhtp/shared";
import { notAnsweredText } from "../../constants";
import { UseOfFundsAttachmentElementExport } from "components/report/UseOfFundsAttachment";
import { ActionTableExport } from "components/fields/ActionTable";
import { TableCheckpointExport } from "components/fields/TableCheckpoint";

//elements that are rendered as part of the table that does not need a unique renderer
const tableElementList = [
  ElementType.Textbox,
  ElementType.Radio,
  ElementType.TextAreaField,
  ElementType.NumberField,
];

const renderElementList = [
  ...tableElementList,
  ElementType.SubHeader,
  ElementType.Paragraph,
  ElementType.TableCheckpoint,
  ElementType.AttachmentArea,
  ElementType.AccordionGroup,
  ElementType.ActionTable,
  ElementType.AttachmentTable,
];

export const shouldUseTable = (type: ElementType) => {
  return tableElementList.includes(type);
};

export const renderElements = (element: PageElement) => {
  const { type } = element;
  if (!renderElementList.includes(type)) return;

  switch (type) {
    case ElementType.SubHeader:
      return (
        <Heading as="h4" variant="nestedHeading">
          {element.text}
        </Heading>
      );
    case ElementType.TableCheckpoint:
      return TableCheckpointExport(element);
    case ElementType.UseOfFundsAttachment:
      return UseOfFundsAttachmentElementExport(element);
    case ElementType.AttachmentArea:
      return "TBD";
    case ElementType.AccordionGroup:
      return "TBD";
    case ElementType.ActionTable:
      return ActionTableExport(element);
    case ElementType.AttachmentTable:
      return "TBD";
  }

  if (!("answer" in element)) {
    return notAnsweredText;
  }

  return element.answer ?? notAnsweredText;
};
