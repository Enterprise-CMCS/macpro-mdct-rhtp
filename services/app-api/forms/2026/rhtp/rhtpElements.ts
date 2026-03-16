import {
  UseOfFundsTableTemplate,
  ElementType,
  PageElement,
  ActionTableTemplate,
} from "../../../types/reports";

export const useOfFundsOptions = {
  dropDownOptions: {
    // These are placeholder
    budgetPeriodOptions: [
      { label: "- Select an option -", value: "" },
      { label: "Budget Period 1", value: "Budget Period 1" },
      { label: "Budget Period 2", value: "Budget Period 2" },
      { label: "Budget Period 3", value: "Budget Period 3" },
      { label: "Budget Period 4", value: "Budget Period 4" },
    ],
    // These are placeholder, the initiatives will be come from a previous question in the report
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

export const checkpointsTables: PageElement[] = [
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-0",
    label: "Planning",
    stage: 0,
    checkpoints: [
      {
        id: "planning-1",
        label: "Establish governance",
        attachable: true,
      },
      {
        id: "planning-2",
        label: "Submit project plan to CMS",
        attachable: false,
      },
    ],
    required: true,
  },
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-1",
    label: "Project Preparation",
    stage: 1,
    checkpoints: [
      {
        id: "project-prop-1",
        label: "CMS approval of project plan",
        attachable: false,
      },
      {
        id: "project-prop-2",
        label: "Launch initiative",
        attachable: true,
      },
    ],
    required: true,
  },
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-2",
    label: "Early Implementation",
    stage: 2,
    checkpoints: [
      {
        id: "early-implementation-1",
        label: "Continue initiative",
        attachable: true,
      },
      {
        id: "early-implementation-2",
        label: "Achieve at least one milestone",
        attachable: true,
      },
      {
        id: "early-implementation-3",
        label: "Establish metric reporting methodology",
        attachable: true,
      },
      {
        id: "early-implementation-4",
        label: "Submit updated project plan to CMS",
        attachable: false,
      },
    ],
    required: true,
  },
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-3",
    label: "Midway Implementation",
    stage: 3,
    checkpoints: [
      {
        id: "midway-imp-1",
        label: "CMS approval of updated project plan",
        attachable: false,
      },
      {
        id: "midway-imp-2",
        label: "Complete Q2 2028 milestones",
        attachable: true,
      },
      {
        id: "midway-imp-3",
        label: "Report initial metric progress to CMS",
        attachable: false,
      },
    ],
    required: true,
  },
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-4",
    label: "Project for Completion",
    stage: 4,
    checkpoints: [
      {
        id: "project-for-complete-1",
        label: "Share final deliverables plan with CMS",
        attachable: false,
      },
      {
        id: "project-for-complete-2",
        label: "CMS approval of final deliverables plan",
        attachable: false,
      },
      {
        id: "project-for-complete-3",
        label: "Complete post-program planning",
        attachable: true,
      },
    ],
    required: true,
  },
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-5",
    label: "Full Implementation",
    stage: 5,
    checkpoints: [
      {
        id: "full-implementation-1",
        label: "Submit final deliverables for CMS",
        attachable: false,
      },
      {
        id: "full-implementation-2",
        label: "Complete all 2030 milestones",
        attachable: true,
      },
      {
        id: "full-implementation-3",
        label: "Report updated metric progress to CMS",
        attachable: false,
      },
    ],
    required: true,
  },
];

export const metricTable: ActionTableTemplate = {
  type: ElementType.ActionTable,
  id: "metrics-table",
  label: "Metrics",
  hintText:
    "To add an metric, click button below. [Hint text here to let users know they must report on 4 metrics per initative]",
  modal: {
    title: "Metric",
    hintText: "[hint text]",
    elements: [
      {
        id: "status",
        type: ElementType.Dropdown,
        editOnly: true,
        children: [
          { label: "Active", value: "Active" },
          { label: "Abandon", value: "Abandon" },
        ],
      },
      { id: "metric", type: ElementType.TextAreaField },
      { id: "currValue", type: ElementType.Textbox },
      { id: "date", type: ElementType.Date },
    ],
  },
  rows: [
    { id: "no", header: "#" },
    { id: "status", header: "Status" },
    { id: "metric", header: "Metric" },
    { id: "prevValue", header: "Previous Value", type: ElementType.Textbox },
    { id: "currValue", header: "Current Value", type: ElementType.Textbox },
    { id: "date", header: "As of Date", type: ElementType.Date },
  ],
  answer: [
    {
      no: 1,
      status: "Active",
      metric: "Rural provider retention rate",
      prevValue: "",
      currValue: "",
      date: "",
    },
    {
      no: 2,
      status: "Active",
      metric: "Percent of rural facilities utilizing RPM",
      prevValue: "",
      currValue: "",
      date: "",
    },
  ],
};
