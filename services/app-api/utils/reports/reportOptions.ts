import { LiteReport, ReportOptions, RhtpSubType } from "../../types/reports";

export const getNextReportOptions = (report: LiteReport): ReportOptions => {
  let nextSubType: RhtpSubType | undefined = report.subType;
  let nextYear: number = report.year;

  // TODO: Update when the quarter naming has been decided on
  switch (report.subType) {
    case RhtpSubType.ANNUAL:
      nextSubType = RhtpSubType.Q1;
      break;
    case RhtpSubType.Q1:
      nextSubType = RhtpSubType.Q2;
      break;
    case RhtpSubType.Q2:
      nextSubType = RhtpSubType.Q3;
      break;
    case RhtpSubType.Q3:
      nextSubType = RhtpSubType.Q4;
      break;
    case RhtpSubType.Q4:
      nextSubType = RhtpSubType.ANNUAL;
      nextYear = report.year + 1;
      break;
  }

  // RhtpSubType = 0 means Annual report
  const name = `${report.state} - ${nextSubType ? "Quarterly" : "Annual"} Report - ${nextSubType ? `Q${nextSubType} ` : ""}${nextYear}`;

  const reportOptions: ReportOptions = {
    name,
    year: nextYear,
    subType: nextSubType,
  };

  return reportOptions;
};
