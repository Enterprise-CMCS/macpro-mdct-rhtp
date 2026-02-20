import {
  ReportSubType,
  LiteReport,
  ReportOptions,
  Quarter,
} from "../../types/reports";

export const getNextReportOptions = (report: LiteReport): ReportOptions => {
  let nextSubType: ReportSubType | undefined = report.subType;
  let nextQuarter: Quarter | undefined = report.quarter;
  let nextYear: number = report.year;

  if (report.subType === ReportSubType.Annual) {
    nextSubType = ReportSubType.Quarterly;
    nextQuarter = Quarter.Q1;
  } else if (report.subType === ReportSubType.Quarterly) {
    switch (report.quarter) {
      case Quarter.Q1:
        nextSubType = ReportSubType.Quarterly;
        nextQuarter = Quarter.Q2;
        break;
      case Quarter.Q2:
        nextSubType = ReportSubType.Quarterly;
        nextQuarter = Quarter.Q3;
        break;
      case Quarter.Q3:
        nextSubType = ReportSubType.Quarterly;
        nextQuarter = Quarter.Q4;
        break;
      case Quarter.Q4:
        nextSubType = ReportSubType.Annual;
        nextQuarter = undefined;
        nextYear = report.year + 1;
        break;
    }
  }

  const name = `${report.state} - ${nextSubType} Report - ${nextQuarter ? `${nextQuarter} ` : ""}${nextYear}`;

  const reportOptions: ReportOptions = {
    name,
    year: nextYear,
    subType: nextSubType,
    quarter: nextQuarter,
  };

  return reportOptions;
};
