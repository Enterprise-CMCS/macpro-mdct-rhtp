import React from "react";
import { VStack } from "@chakra-ui/react";
import {
  HeaderElement,
  SubHeaderElement,
  ParagraphElement,
  AccordionElement,
  ButtonLinkElement,
  DividerElement,
} from "./Elements";
import {
  assertExhaustive,
  ElementType,
  PageElement,
  ReportStatus,
} from "../../types";
import {
  DateField,
  DropdownField,
  RadioField,
  StatusTableElement,
  TextAreaField,
  TextField,
  StatusAlert,
  CheckboxField,
  ListInput,
} from "components";
import { useStore } from "utils";
import { SubmissionParagraph } from "./SubmissionParagraph";
import { AttachmentArea } from "components/fields/AttachmentArea";

interface Props {
  id: string;
  elements: PageElement[];
  setElements: (elements: PageElement[]) => void;
}

export const Page = ({ id, setElements, elements }: Props) => {
  const { userIsEndUser } = useStore().user || {};
  const { report } = useStore();

  const buildElement = (element: PageElement, index: number) => {
    const disabled =
      !userIsEndUser || report?.status === ReportStatus.SUBMITTED;
    const updateElement = (updatedElement: Partial<typeof element>) => {
      setElements([
        ...elements.slice(0, index),
        { ...element, ...updatedElement } as typeof element,
        ...elements.slice(index + 1),
      ]);
    };

    switch (element.type) {
      case ElementType.Header:
        return <HeaderElement {...{ element }} />;
      case ElementType.SubHeader:
        return <SubHeaderElement {...{ element }} />;
      case ElementType.Paragraph:
        return <ParagraphElement {...{ element }} />;
      case ElementType.Textbox:
        return <TextField {...{ updateElement, disabled, element }} />;
      case ElementType.TextAreaField:
        return <TextAreaField {...{ updateElement, disabled, element }} />;
      case ElementType.NumberField:
        return <TextField {...{ updateElement, disabled, element }} />;
      case ElementType.Date:
        return <DateField {...{ updateElement, disabled, element }} />;
      case ElementType.Dropdown:
        return <DropdownField {...{ updateElement, disabled, element }} />;
      case ElementType.Accordion:
        return <AccordionElement {...{ disabled, element }} />;
      case ElementType.Radio:
        return <RadioField {...{ updateElement, disabled, element }} />;
      case ElementType.Checkbox:
        return <CheckboxField {...{ updateElement, disabled, element }} />;
      case ElementType.ButtonLink:
        return <ButtonLinkElement {...{ disabled, element }} />;
      case ElementType.StatusTable:
        return <StatusTableElement />;
      case ElementType.StatusAlert:
        return <StatusAlert {...{ element }} />;
      case ElementType.Divider:
        return <DividerElement {...{ element }} />;
      case ElementType.SubmissionParagraph:
        return <SubmissionParagraph />;
      case ElementType.ListInput:
        return <ListInput {...{ updateElement, disabled, element }} />;
      case ElementType.AttachmentArea:
        return <AttachmentArea {...{ updateElement, disabled, element }} />;
      default:
        assertExhaustive(element);
        return null;
    }
  };

  const composedElements = elements.map((element, index) => {
    const el = buildElement(element, index);
    return <React.Fragment key={`${id}-${index}`}>{el}</React.Fragment>;
  });

  return (
    <VStack alignItems="flex-start" gap="spacer4">
      {composedElements}
    </VStack>
  );
};
