import { ReportType, RhtpSubTypeData, RhtpSubTypeMap } from "@rhtp/shared";
import { rhtpReportTemplate } from "../forms/2026/rhtp/rhtp";

export const RhtpSubTypeTemplateMap: RhtpSubTypeData = {
  A1: {
    ...RhtpSubTypeMap.A1,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q1: {
    ...RhtpSubTypeMap.Q1,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q2: {
    ...RhtpSubTypeMap.Q2,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q3: {
    ...RhtpSubTypeMap.Q3,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  A2: {
    ...RhtpSubTypeMap.A2,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q4: {
    ...RhtpSubTypeMap.Q4,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q5: {
    ...RhtpSubTypeMap.Q5,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q6: {
    ...RhtpSubTypeMap.Q6,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  A3: {
    ...RhtpSubTypeMap.A3,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q7: {
    ...RhtpSubTypeMap.Q7,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q8: {
    ...RhtpSubTypeMap.Q8,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q9: {
    ...RhtpSubTypeMap.Q9,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  A4: {
    ...RhtpSubTypeMap.A4,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q10: {
    ...RhtpSubTypeMap.Q10,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q11: {
    ...RhtpSubTypeMap.Q11,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q12: {
    ...RhtpSubTypeMap.Q12,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  A5: {
    ...RhtpSubTypeMap.A5,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  Q13: {
    ...RhtpSubTypeMap.Q13,
    reportTemplateBuilder: rhtpReportTemplate,
  },
  FINAL: {
    ...RhtpSubTypeMap.FINAL,
    reportTemplateBuilder: rhtpReportTemplate,
  },
};

export const error = {
  UNAUTHORIZED: "User is not authorized to access this resource.",
  NO_KEY: "Must provide key for table.",
  MISSING_DATA: "Missing required data.",
  INVALID_DATA: "Provided data is not valid.",
  SERVER_ERROR: "An unspecified server error occurred.",
  CREATION_ERROR: "Could not be created due to a database error.",
  END_DATE_BEFORE_START_DATE: "End date can't be before start date",
};

export const reportTables: { [key in ReportType]: string } = {
  RHTP: process.env.RhtpReportsTable!,
};

export const tableTopics: { [key in ReportType]: string } = {
  RHTP: "rhtp-reports",
};
