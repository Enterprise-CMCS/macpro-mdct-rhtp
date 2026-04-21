// BANNERS
export const bannerId = "admin-banner-id";
export const attachmentTableId = "initiative-attachments-table";

export const ErrorMessages = {
  endDateBeforeStartDate: "End date can't be before start date",
  mustBeADate: "Response must be a date in MMDDYYYY format",
  mustBeADateOptional:
    "If provided, response must be a date in MMDDYYYY format",
  mustBeANumber: "Response must be a number",
  requiredResponse: "A response is required",
  mustBeAnEmail: "Response must be a valid email address",
  denominatorZero: (
    numerator: string = "Numerator",
    denominator: string = "denominator"
  ) => `${numerator} must be 0 when the ${denominator} is 0`,
  mustBeUniqueReportName:
    "A report with this name already exists during this reporting period.",
  mustBeACurrency: "Response must be a valid currency amount",
  mustBeALink: "Response must be a valid url",
} as const;

export const PRODUCTION_HOST_DOMAIN = "mdctrhtp.cms.gov";

export const notAnsweredText = "Not answered";
export const autoPopulatedText = "Auto-populates from previous response";
export const autoCalculatesText = "Auto-calculates from previous response";

export const HELP_DESK_EMAIL_ADDRESS = "mdct_help@cms.hhs.gov" as const;

// TIMEOUT PARAMS
export const IDLE_WINDOW = 30 * 60 * 1000; // ms
export const PROMPT_AT = 29 * 60 * 1000; //ms
