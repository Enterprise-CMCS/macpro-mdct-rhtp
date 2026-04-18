import { ReportType, RhtpSubType } from "../types/reports";
export * from "@rhtp/shared";

// TODO: These are the generic quarter start dates. Update when actual dates get decided on
export const reportStartDates = {
  [RhtpSubType.ANNUAL]: (year: number) => new Date(year, 0, 1).getTime(),
  [RhtpSubType.Q1]: (year: number) => new Date(year, 0, 1).getTime(),
  [RhtpSubType.Q2]: (year: number) => new Date(year, 3, 1).getTime(),
  [RhtpSubType.Q3]: (year: number) => new Date(year, 6, 1).getTime(),
  [RhtpSubType.Q4]: (year: number) => new Date(year, 9, 1).getTime(),
};

export const error = {
  UNAUTHORIZED: "User is not authorized to access this resource.",
  NO_KEY: "Must provide key for table.",
  MISSING_DATA: "Missing required data.",
  INVALID_DATA: "Provided data is not valid.",
  SERVER_ERROR: "An unspecified server error occured.",
  CREATION_ERROR: "Could not be created due to a database error.",
  END_DATE_BEFORE_START_DATE: "End date can't be before start date",
};

export const reportTables: { [key in ReportType]: string } = {
  RHTP: process.env.RhtpReportsTable!,
};

export const tableTopics: { [key in ReportType]: string } = {
  RHTP: "rhtp-reports",
};
