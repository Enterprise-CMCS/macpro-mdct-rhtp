import { ElementType, FormPageTemplate, PageType } from "@rhtp/shared";
import { useOfFundsTableElement } from "../rhtpElements";

export const useOfFunds: FormPageTemplate = {
  id: "use-of-funds",
  title: "Use of Funds",
  type: PageType.Standard,
  sidebar: true,
  elements: [
    {
      type: ElementType.Paragraph,
      id: "use-of-funds-main-instructions",
      text: "Instructions go here that need to be seen at all times. Provide details and context to help the user complete this page.",
    },
    {
      type: ElementType.Accordion,
      id: "use-of-funds-instructions",
      label: "Instructions",
      value:
        "<b>Instructions for Completing this section</b>" +
        "<p>Add the rest of instructions here.</p>",
    },
    {
      type: ElementType.Paragraph,
      id: "use-of-funds-table-text",
      title: "Spent Funds",
      text: `To add an use of funds, click the "Add use of funds" button below.`,
    },
    useOfFundsTableElement,
  ],
};
