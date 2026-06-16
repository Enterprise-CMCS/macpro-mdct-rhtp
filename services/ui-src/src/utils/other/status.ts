import { LiteReport, ReportStatus } from "@rhtp/shared";

export const getStatus = (report: LiteReport) => {
  if (
    report.status === ReportStatus.IN_PROGRESS &&
    report.submissionCount >= 1
  ) {
    return "In revision";
  }
  return report.status;
};
