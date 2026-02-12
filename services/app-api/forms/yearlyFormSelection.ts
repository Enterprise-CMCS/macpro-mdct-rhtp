import { ReportType } from "../types/reports";
import { rhtpReportTemplate as rhtpReportTemplate2026 } from "./2026/rhtp/rhtp";

const formsByYear = {
  2026: {
    rhtpReportTemplate: rhtpReportTemplate2026,
  },
};

function assertYearIsValid(
  year: number
): asserts year is keyof typeof formsByYear {
  if (year in formsByYear) {
    return;
  } else {
    throw new Error(
      `Invalid year - form templates for ${year} are not implemented`
    );
  }
}

export const getReportTemplate = (reportType: ReportType, year: number) => {
  assertYearIsValid(year);
  switch (reportType) {
    case ReportType.RHTP:
      return formsByYear[year].rhtpReportTemplate;
    default:
      throw new Error(
        `Not implemented - getReportTemplate for ReportType ${reportType}`
      );
  }
};
