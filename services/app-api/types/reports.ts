import { StateAbbr } from "../utils/constants";

export enum ReportType {
  RHTP = "RHTP",
}

export const isReportType = (
  reportType: string | undefined
): reportType is ReportType => {
  return Object.values(ReportType).includes(reportType as ReportType);
};

export interface ReportOptions {
  name: string;
  year: number;
}

export enum ReportStatus {
  NOT_STARTED = "Not started",
  IN_PROGRESS = "In progress",
  SUBMITTED = "Submitted",
}

export enum AlertTypes {
  ERROR = "error",
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
}

export enum PageStatus {
  NOT_STARTED = "Not started",
  IN_PROGRESS = "In progress",
  COMPLETE = "Complete",
}

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

export type ReportBase = {
  type: ReportType;
  year: number;
  pages: (ParentPageTemplate | FormPageTemplate | ReviewSubmitTemplate)[];
};

export type ParentPageTemplate = {
  id: PageId;
  childPageIds: PageId[];
  title?: undefined;
  type?: undefined;
  elements?: undefined;
  sidebar?: undefined;
  hideNavButtons?: undefined;
};

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

export type PageId = string;

export enum PageType {
  Standard = "standard",
  Modal = "modal",
  ReviewSubmit = "reviewSubmit",
}

export enum ElementType {
  Header = "header",
  SubHeader = "subHeader",
  Textbox = "textbox",
  TextAreaField = "textAreaField",
  NumberField = "numberField",
  Date = "date",
  Dropdown = "dropdown",
  Accordion = "accordion",
  Paragraph = "paragraph",
  Radio = "radio",
  Checkbox = "checkbox",
  ButtonLink = "buttonLink",
  StatusTable = "statusTable",
  LengthOfStayRate = "lengthOfStay",
  ReadmissionRate = "readmissionRate",
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
  | SubmissionParagraphTemplate
  | ListInputTemplate;

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
  label?: string;
  to?: PageId;
  style?: string;
};

export type DividerTemplate = {
  type: ElementType.Divider;
  id: string;
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
