import {
  ElementType,
  FormPageTemplate,
  PageType,
  UseOfFundsTableTemplate,
  dropdownEmptyOption,
} from "@rhtp/shared";

const useOfFundsOptions = {
  dropDownOptions: {
    budgetPeriodOptions: [
      dropdownEmptyOption,
      { label: "Budget Period 1", value: "Budget Period 1" },
      { label: "Budget Period 2", value: "Budget Period 2" },
      { label: "Budget Period 3", value: "Budget Period 3" },
      { label: "Budget Period 4", value: "Budget Period 4" },
      { label: "Budget Period 5", value: "Budget Period 5" },
    ],
    useOfFundsOptions: [
      dropdownEmptyOption,
      {
        label: "Prevention and chronic disease",
        value: "Prevention and chronic disease",
      },
      { label: "Provider payments", value: "Provider payments" },
      { label: "Consumer tech solutions", value: "Consumer tech solutions" },
      {
        label: "Training and technical assistance",
        value: "Training and technical assistance",
      },
      { label: "Workforce", value: "Workforce" },
      { label: "IT advances", value: "IT advances" },
      {
        label: "Appropriate care availability",
        value: "Appropriate care availability",
      },
      { label: "Behavioral health", value: "Behavioral health" },
      { label: "Innovative care", value: "Innovative care" },
      {
        label: "Capital expenditures and infrastructure",
        value: "Capital expenditures and infrastructure",
      },
      { label: "Fostering collaboration", value: "Fostering collaboration" },
    ],
    recipientCategoryOptions: [
      dropdownEmptyOption,
      { label: "State agency", value: "State agency" },
      { label: "Local government", value: "Local government" },
      { label: "Rural provider", value: "Rural provider" },
      { label: "EMS provider", value: "EMS provider" },
      {
        label: "Community-based organization",
        value: "Community-based organization",
      },
      {
        label: "University-affiliated health care organization",
        value: "University-affiliated health care organization",
      },
      {
        label: "Non-profit health care organization",
        value: "Non-profit health care organization",
      },
      {
        label: "Other non-profit organization",
        value: "Other non-profit organization",
      },
      {
        label: "Other health care organization",
        value: "Other health care organization",
      },
      { label: "Contractor", value: "Contractor" },
      { label: "Other", value: "Other" },
    ],
  },
};

const useOfFundsTableElement: UseOfFundsTableTemplate = {
  type: ElementType.UseOfFundsTable,
  id: "use-of-funds-table",
  ...useOfFundsOptions,
};

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
        "<b>Budget Period dates for each Budget Period listed in the table below will consist of the following:</b>" +
        "<ul>" +
        "  <li>Budget Period 1 (12/29/2025 - 10/30/2026)</li>" +
        "  <li>Budget Period 2 (10/31/2026 - 10/30/2027)</li>" +
        "  <li>Budget Period 3 (10/31/2027 - 10/30/2028)</li>" +
        "  <li>Budget Period 4 (10/31/2028 - 10/30/2029)</li>" +
        "  <li>Budget Period 5 (10/31/2029 - 10/30/2030)</li>" +
        "</ul>",
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
