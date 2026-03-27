import { Heading } from "@chakra-ui/react";
import { ElementType, PageElement } from "types";
import { notAnsweredText } from "../../constants";
import { UseOfFundsTableElementExport } from "components/report/UseOfFundsTable";

//elements that are rendered as part of the table that does not need a unique renderer
const tableElementList = [
  ElementType.Textbox,
  ElementType.Radio,
  ElementType.TextAreaField,
];

const renderElementList = [
  ...tableElementList,
  ElementType.SubHeader,
  ElementType.TableCheckpoint,
  ElementType.AttachmentArea,
  ElementType.AccordionGroup,
  ElementType.ActionTable,
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
      return "TBD";
    case ElementType.UseOfFundsTable:
      return UseOfFundsTableElementExport(element);
    case ElementType.AttachmentArea:
      return "TBD";
    case ElementType.AccordionGroup:
      return "TBD";
    case ElementType.AttachmentTable:
      return "TBD";
    case ElementType.ActionTable:
      return "TBD";
  }

  if (!("answer" in element)) {
    return notAnsweredText;
  }

  return element.answer ?? notAnsweredText;
};
