import { UseOfFundsTableTemplate, ElementType } from "../../../types/reports";

export const useOfFundsOptions = {
  dropDownOptions: {
    budgetPeriodOptions: [
      { label: "- Select an option -", value: "" },
      { label: "Budget Period 1", value: "Budget Period 1" },
      { label: "Budget Period 2", value: "Budget Period 2" },
      { label: "Budget Period 3", value: "Budget Period 3" },
      { label: "Budget Period 4", value: "Budget Period 4" },
    ],
    initiativeOptions: [
      { label: "- Select an option -", value: "" },
      { label: "1", value: "1" },
      { label: "2", value: "2" },
      { label: "3", value: "3" },
      { label: "4", value: "4" },
    ],
    useOfFundsOptions: [
      { label: "- Select an option -", value: "" },
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
      { label: "- Select an option -", value: "" },
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

export const useOfFundsTableElement: UseOfFundsTableTemplate = {
  type: ElementType.UseOfFundsTable,
  id: "use-of-funds-table",
  ...useOfFundsOptions,
};
