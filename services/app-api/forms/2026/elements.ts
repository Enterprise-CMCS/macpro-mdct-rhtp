import { ButtonLinkTemplate, ElementType } from "../../types/reports";

// Any elements that are reused across multiple reports are added here

export const exportToPDF: ButtonLinkTemplate = {
  type: ElementType.ButtonLink,
  id: "pdf-btn",
  label: "Download PDF",
  to: "export",
  style: "pdf",
};
