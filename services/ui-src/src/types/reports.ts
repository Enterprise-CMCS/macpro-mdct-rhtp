import { AlertTypes, StateAbbr } from "./other";

export enum ReportType {
  RHTP = "RHTP",
}

// TODO: Update when the quarter naming has been decided on
export enum RhtpSubType {
  ANNUAL = 0,
  Q1 = 1,
  Q2 = 2,
  Q3 = 3,
  Q4 = 4,
}

export const isReportType = (
  reportType: string | undefined
): reportType is ReportType => {
  return Object.values(ReportType).includes(reportType as ReportType);
};

export interface CreateReportOptions {
  copyFromReportId?: string;
}

export interface ReportOptions {
  name: string;
  year: number;
  subType?: RhtpSubType;
  copyFromReportId?: string;
}

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

export type UploadListProp = {
  name: string;
  size: number;
  fileId: string;
};

export type ReportBase = {
  type: ReportType;
  subType?: RhtpSubType;
  year: number;
  pages: (ParentPageTemplate | FormPageTemplate | ReviewSubmitTemplate)[];
};

export interface Report extends ReportBase, ReportOptions {
  id: string;
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

export type CheckpointShape = {
  id: string;
  label: string;
  attachable: boolean;
};

export type CheckpointAnswerShape = {
  id: string;
  label: string;
  completed: boolean;
  attachments?: UploadListProp[];
};

export enum PageType {
  Standard = "standard",
  ReviewSubmit = "reviewSubmit",
}

export type AccordionGroupItem = {
  label: string;
  children: PageElement[];
};

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
  TableCheckpoint = "tableCheckpoint",
  UseOfFundsTable = "useOfFundsTable",
  AttachmentArea = "attachmentArea",
  AccordionGroup = "accordionGroup",
  InitiativesTable = "initiativesTable",
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
  | UseOfFundsTableTemplate
  | SubmissionParagraphTemplate
  | TableCheckpointTemplate
  | AttachmentAreaTemplate
  | AccordionGroupTemplate
  | InitiativesTableTemplate;

export type HideCondition = {
  controllerElementId: string;
  answer: string;
};

export type ChoiceTemplate = {
  label: string;
  value: string;
  checked?: boolean;
  checkedChildren?: PageElement[];
};

export type AccordionTemplate = {
  type: ElementType.Accordion;
  id: string;
  label: string;
  value: string;
};

export type ButtonLinkTemplate = {
  type: ElementType.ButtonLink;
  id: string;
  label: string;
  to: PageId;
  style?: string;
};

export type DividerTemplate = {
  type: ElementType.Divider;
  id: string;
};

export type InitiativesTableTemplate = {
  id: string;
  type: ElementType.InitiativesTable;
};

export type StatusTableTemplate = {
  type: ElementType.StatusTable;
  id: string;
  to: PageId;
};

export type SubmissionParagraphTemplate = {
  type: ElementType.SubmissionParagraph;
  id: string;
};

export enum HeaderIcon {
  Check = "check",
}

interface DisplayElementTemplate {
  type: ElementType;
  id: string;
  text: string;
}

export interface HeaderTemplate extends DisplayElementTemplate {
  type: ElementType.Header;
  icon?: HeaderIcon;
}

export interface ParagraphTemplate extends DisplayElementTemplate {
  type: ElementType.Paragraph;
  title?: string;
  weight?: string;
}

export interface StatusAlertTemplate extends DisplayElementTemplate {
  type: ElementType.StatusAlert;
  title: string;
  status: AlertTypes;
}

export interface SubHeaderTemplate extends DisplayElementTemplate {
  type: ElementType.SubHeader;
  helperText?: string;
  hideCondition?: HideCondition;
}

interface InputElementTemplate {
  type: ElementType;
  id: string;
  label: string;
  helperText?: string;
  required: boolean;
  quarterly?: boolean;
  disabled?: boolean;
}

export interface CheckboxTemplate extends InputElementTemplate {
  type: ElementType.Checkbox;
  choices: ChoiceTemplate[];
  answer?: string[];
}

export interface DateTemplate extends InputElementTemplate {
  type: ElementType.Date;
  answer?: string;
}

export interface DropdownTemplate extends InputElementTemplate {
  type: ElementType.Dropdown;
  options: ChoiceTemplate[];
  answer?: string;
}

export interface ListInputTemplate extends InputElementTemplate {
  type: ElementType.ListInput;
  fieldLabel: string;
  buttonText: string;
  answer?: string[];
}

export interface NumberFieldTemplate extends InputElementTemplate {
  type: ElementType.NumberField;
  answer?: number;
  hideCondition?: never;
}

export interface AttachmentAreaTemplate extends InputElementTemplate {
  type: ElementType.AttachmentArea;
  answer?: UploadListProp[];
}

export interface RadioTemplate extends InputElementTemplate {
  type: ElementType.Radio;
  choices: ChoiceTemplate[];
  answer?: string;
  hideCondition?: HideCondition;
  clickAction?: string;
}

export interface TextAreaBoxTemplate extends InputElementTemplate {
  type: ElementType.TextAreaField;
  answer?: string;
  hideCondition?: HideCondition;
}

export interface TextboxTemplate extends InputElementTemplate {
  type: ElementType.Textbox;
  answer?: string;
  hideCondition?: HideCondition;
}

export interface TableCheckpointTemplate extends InputElementTemplate {
  type: ElementType.TableCheckpoint;
  stage: number;
  checkpoints: CheckpointShape[];
  answer?: CheckpointAnswerShape[];
}

export interface AccordionGroupTemplate {
  type: ElementType.AccordionGroup;
  id: string;
  accordions: AccordionGroupItem[];
  required: boolean;
  answer?: boolean[];
}
export type UseOfFundsTableItem = {
  id: string;
  budgetPeriod: string;
  spentFunds: string;
  description: string;
  initiative: string;
  useOfFunds: string;
  recipientName: string;
  recipientCategory: string;
};

export type UseOfFundsTableTemplate = {
  type: ElementType.UseOfFundsTable;
  id: string;
  dropDownOptions: {
    budgetPeriodOptions: { label: string; value: string }[];
    initiativeOptions: { label: string; value: string }[];
    useOfFundsOptions: { label: string; value: string }[];
    recipientCategoryOptions: { label: string; value: string }[];
  };
  answer?: UseOfFundsTableItem[];
};

/**
 * Instructs Typescript to complain if it detects that this function may be reachable.
 * Useful for the default branch of a switch statement that verifiably covers every case.
 */
export const assertExhaustive = (_: never): void => {};
