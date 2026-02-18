import { StateAbbr } from "../utils/constants";

export enum ReportType {
  RHTP = "RHTP",
}

export const isReportType = (x: string | undefined): x is ReportType => {
  return Object.values(ReportType).includes(x as ReportType);
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
  Measure = "measure",
  MeasureResults = "measureResults",
  ReviewSubmit = "reviewSubmit",
}

export enum ElementType {
  Header = "header",
  SubHeader = "subHeader",
  SubHeaderMeasure = "subHeaderMeasure",
  NestedHeading = "nestedHeading",
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
  MeasureTable = "measureTable",
  MeasureResultsNavigationTable = "measureResultsNavigationTable",
  StatusTable = "statusTable",
  MeasureDetails = "measureDetails",
  MeasureFooter = "measureFooter",
  LengthOfStayRate = "lengthOfStay",
  ReadmissionRate = "readmissionRate",
  NdrFields = "ndrFields",
  NdrEnhanced = "ndrEnhanced",
  Ndr = "ndr",
  NdrBasic = "ndrBasic",
  StatusAlert = "statusAlert",
  Divider = "divider",
  SubmissionParagraph = "submissionParagraph",
  ListInput = "listInput",
  EligibilityTable = "eligibilityTable",
}

export type PageElement =
  | HeaderTemplate
  | SubHeaderTemplate
  | SubHeaderMeasureTemplate
  | NestedHeadingTemplate
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

export enum HeaderIcon {
  Check = "check",
}

export type HeaderTemplate = {
  type: ElementType.Header;
  id: string;
  text: string;
  icon?: HeaderIcon;
};

export const isHeaderTemplate = (
  element: PageElement
): element is HeaderTemplate => {
  return element.type === ElementType.Header;
};

export type SubHeaderTemplate = {
  type: ElementType.SubHeader;
  id: string;
  text: string;
  helperText?: string;
  hideCondition?: HideCondition;
};

export type SubHeaderMeasureTemplate = {
  type: ElementType.SubHeaderMeasure;
  id: string;
};

export type NestedHeadingTemplate = {
  type: ElementType.NestedHeading;
  id: string;
  text: string;
};

export type ParagraphTemplate = {
  type: ElementType.Paragraph;
  id: string;
  title?: string;
  text: string;
  weight?: string;
};

export type InputTemplate = {
  id: string;
  label: string;
  helperText?: string;
  answer?: string;
  required: boolean;
  disabled?: boolean;
};

export type TextboxTemplate = InputTemplate & {
  type: ElementType.Textbox;
  hideCondition?: HideCondition;
};

export type NumberFieldTemplate = InputTemplate & {
  type: ElementType.NumberField;
  hideCondition?: HideCondition;
};

export type TextAreaBoxTemplate = InputTemplate & {
  type: ElementType.TextAreaField;
  hideCondition?: HideCondition;
};

export type DateTemplate = InputTemplate & {
  type: ElementType.Date;
};

export type DropdownTemplate = InputTemplate & {
  type: ElementType.Dropdown;
  options: ChoiceTemplate[];
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

export type RadioTemplate = InputTemplate & {
  type: ElementType.Radio;
  choices: ChoiceTemplate[];
  hideCondition?: HideCondition;
  clickAction?: string;
};

export type CheckboxTemplate = InputTemplate & {
  type: ElementType.Checkbox;
  choices: ChoiceTemplate[];
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

export type StatusTableTemplate = {
  type: ElementType.StatusTable;
  id: string;
  to: PageId;
};

export type StatusAlertTemplate = {
  type: ElementType.StatusAlert;
  id: string;
  title: string;
  text: string;
  status: AlertTypes;
};
