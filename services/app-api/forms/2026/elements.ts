import {
  ButtonLinkTemplate,
  ElementType,
  HeaderTemplate,
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
