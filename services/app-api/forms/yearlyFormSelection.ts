import { isStateAbbr, ReportBase, ReportType } from "@rhtp/shared";
import { rhtpReportTemplate as rhtpReportTemplate2026 } from "./2026/rhtp/rhtp";

const formsByYearAndState: { [year: number]: (state: string) => ReportBase } = {
  2026: (state: string) => rhtpReportTemplate2026(state),
};

function assertYearAndStateAreValid(year: number, state: string) {
  if (year in formsByYearAndState && isStateAbbr(state)) {
    return;
  } else {
    throw new Error(
      `Invalid year - form templates for ${year} are not implemented`
    );
  }
}

export const getReportTemplate = (
  reportType: ReportType,
  year: number,
  state: string
) => {
  assertYearAndStateAreValid(year, state);
  switch (reportType) {
    case ReportType.RHTP:
      return formsByYearAndState[year](state);
    default:
      throw new Error(
        `Not implemented - getReportTemplate for ReportType ${reportType}`
      );
  }
};
