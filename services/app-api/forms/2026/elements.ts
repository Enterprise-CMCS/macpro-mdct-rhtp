import {
  AccordionTemplate,
  ButtonLinkTemplate,
  ElementType,
  HeaderTemplate,
  NumberFieldTemplate,
  ParagraphTemplate,
  TextAreaBoxTemplate,
} from "../../types/reports";

// Any elements that are reused across multiple reports are added here

export const exportToPDF: ButtonLinkTemplate = {
  type: ElementType.ButtonLink,
  id: "pdf-btn",
  label: "Download PDF",
  to: "export",
  style: "pdf",
};

export const returnToInitiativesDashboard: ButtonLinkTemplate = {
  type: ElementType.ButtonLink,
  id: "return-button",
  to: "initiatives",
  label: "Return to initiatives dashboard",
};

export const initiativeHeader: (initiativeName: string) => HeaderTemplate = (
  initiativeName: string
) => ({
  type: ElementType.Header,
  id: "initiative-header",
  text: initiativeName,
});

export const initiativeInstructions: ParagraphTemplate = {
  type: ElementType.Paragraph,
  id: "initiative-instructions",
  text: "Instructions go here that need to be seen at all times. Provide details and context to help the user complete this page.",
};

export const initiativeInstructionsAccordion: AccordionTemplate = {
  type: ElementType.Accordion,
  id: "initiative-instructions-accordion",
  label: "Further instructions",
  value: "More coming soon...",
};

export const initiativeNarrative: TextAreaBoxTemplate = {
  type: ElementType.TextAreaField,
  id: "initiative-narrative",
  label: "Narrative",
  required: true,
};

export const initiativeNumberOfPeopleServed: NumberFieldTemplate = {
  type: ElementType.NumberField,
  id: "initiative-number-of-people-served",
  label: "Number of people served",
  required: true,
};
