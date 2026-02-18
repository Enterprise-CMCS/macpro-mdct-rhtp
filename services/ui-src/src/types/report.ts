import { AlertTypes, StateAbbr } from "./other";

export enum ReportType {
  RHTP = "RHTP",
}

export const isReportType = (
  reportType: string | undefined
): reportType is ReportType => {
  return Object.values(ReportType).includes(reportType as ReportType);
};

export const getReportName = (type: string | undefined) => {
  switch (type) {
    default:
      return "RHTP";
  }
};

export enum ReportStatus {
  NOT_STARTED = "Not started",
  IN_PROGRESS = "In progress",
  SUBMITTED = "Submitted",
}

export enum PageStatus {
  NOT_STARTED = "Not started",
  IN_PROGRESS = "In progress",
  COMPLETE = "Complete",
}

export type ReportBase = {
  type: ReportType;
  year: number;
  pages: (ParentPageTemplate | FormPageTemplate | ReviewSubmitTemplate)[];
};

export interface Report extends ReportBase, ReportOptions {
  id?: string;
  name: string;
  state: StateAbbr;
  created?: number;
  lastEdited?: number;
  lastEditedBy?: string;
  lastEditedByEmail?: string;
  submitted?: number;
  submissionDates?: { submitted: number }[];
  submittedBy?: string;
  submittedByEmail?: string;
  status: ReportStatus;
  submissionCount: number;
  archived: boolean;
}

export type LiteReport = Omit<Report, "pages">;

export type PageTemplate =
  | ParentPageTemplate
  | FormPageTemplate
  | ReviewSubmitTemplate;

export type ParentPageTemplate = {
  id: PageId;
  childPageIds: PageId[];
  title?: undefined;
  type?: undefined;
  elements?: undefined;
  sidebar?: undefined;
  hideNavButtons?: undefined;
};

export interface PageData {
  parent: string;
  childPageIds: string[];
  index: number;
}

export type FormPageTemplate = {
  id: PageId;
  title: string;
  type: PageType;
  status?: PageStatus;
  elements: PageElement[];
  sidebar?: boolean;
  hideNavButtons?: boolean;
  childPageIds?: PageId[];
};

export interface ReviewSubmitTemplate extends FormPageTemplate {
  submittedView: PageElement[];
}

export const isReviewSubmitPage = (
  page: PageTemplate
): page is ReviewSubmitTemplate => {
  return page.type === PageType.ReviewSubmit && "submittedView" in page;
};

export const isFormPageTemplate = (
  page: PageTemplate
): page is FormPageTemplate => {
  return (page as FormPageTemplate).title != undefined;
};

export type PageId = string;

export enum PageType {
  Standard = "standard",
  ReviewSubmit = "reviewSubmit",
}

export enum ElementType {
  Header = "header",
  SubHeader = "subHeader",
  Textbox = "textbox",
  NumberField = "numberField",
  TextAreaField = "textAreaField",
  Date = "date",
  Dropdown = "dropdown",
  Accordion = "accordion",
  Paragraph = "paragraph",
  Radio = "radio",
  Checkbox = "checkbox",
  ButtonLink = "buttonLink",
  StatusTable = "statusTable",
  StatusAlert = "statusAlert",
  Divider = "divider",
  SubmissionParagraph = "submissionParagraph",
  ListInput = "listInput",
}

export type PageElement =
  | HeaderTemplate
  | SubHeaderTemplate
  | TextboxTemplate
  | NumberFieldTemplate
  | TextAreaBoxTemplate
  | DateTemplate
  | DropdownTemplate
  | AccordionTemplate
  | ParagraphTemplate
  | RadioTemplate
  | CheckboxTemplate
  | ButtonLinkTemplate
  | StatusTableTemplate
  | StatusAlertTemplate
  | DividerTemplate
  | ListInputTemplate
  | SubmissionParagraphTemplate;

export type HideCondition = {
  controllerElementId: string;
  answer: string;
};

export enum HeaderIcon {
  Check = "check",
}

export type HeaderTemplate = {
  type: ElementType.Header;
  id: string;
  text: string;
  icon?: HeaderIcon;
};

export type SubHeaderTemplate = {
  type: ElementType.SubHeader;
  id: string;
  text: string;
  helperText?: string;
  hideCondition?: HideCondition;
};

export type ParagraphTemplate = {
  type: ElementType.Paragraph;
  id: string;
  title?: string;
  text: string;
  weight?: string;
};

export type StatusAlertTemplate = {
  type: ElementType.StatusAlert;
  id: string;
  title: string;
  text: string;
  status: AlertTypes;
};

export type TextboxTemplate = {
  type: ElementType.Textbox;
  id: string;
  label: string;
  helperText?: string;
  answer?: string;
  required: boolean;
  hideCondition?: HideCondition;
  disabled?: boolean;
};

export type NumberFieldTemplate = {
  type: ElementType.NumberField;
  id: string;
  label: string;
  helperText?: string;
  answer?: number;
  required: boolean;
  hideCondition?: never;
  disabled?: boolean;
};

export type TextAreaBoxTemplate = {
  type: ElementType.TextAreaField;
  id: string;
  label: string;
  helperText?: string;
  answer?: string;
  hideCondition?: HideCondition;
  required: boolean;
};

export type DateTemplate = {
  type: ElementType.Date;
  id: string;
  label: string;
  helperText: string;
  answer?: string;
  required: boolean;
};

export type DropdownTemplate = {
  type: ElementType.Dropdown;
  id: string;
  label: string;
  options: ChoiceTemplate[];
  helperText?: string;
  answer?: string;
  required: boolean;
};

export type DividerTemplate = {
  type: ElementType.Divider;
  id: string;
};

export type SubmissionParagraphTemplate = {
  type: ElementType.SubmissionParagraph;
  id: string;
};

export type AccordionTemplate = {
  type: ElementType.Accordion;
  id: string;
  label: string;
  value: string;
};

export type StatusTableTemplate = {
  type: ElementType.StatusTable;
  id: string;
  to: PageId;
};

export type RadioTemplate = {
  type: ElementType.Radio;
  id: string;
  label: string;
  choices: ChoiceTemplate[];
  helperText?: string;
  answer?: string;
  required: boolean;
  hideCondition?: HideCondition;
  clickAction?: string;
};

export type CheckboxTemplate = {
  type: ElementType.Checkbox;
  id: string;
  label: string;
  choices: ChoiceTemplate[];
  helperText?: string;
  answer?: string[];
  required: boolean;
};

export type ButtonLinkTemplate = {
  type: ElementType.ButtonLink;
  id: string;
  label?: string;
  to?: PageId;
  style?: string;
};

export type ListInputTemplate = {
  type: ElementType.ListInput;
  id: string;
  label: string;
  fieldLabel: string;
  helperText: string;
  buttonText: string;
  answer?: string[];
  required: boolean;
};

export type ChoiceTemplate = {
  label: string;
  value: string;
  checked?: boolean;
  checkedChildren?: PageElement[];
};

export interface ReportOptions {
  name: string;
  year: number;
  options?: {};
}

/**
 * Instructs Typescript to complain if it detects that this function may be reachable.
 * Useful for the default branch of a switch statement that verifiably covers every case.
 */
export const assertExhaustive = (_: never): void => {};
