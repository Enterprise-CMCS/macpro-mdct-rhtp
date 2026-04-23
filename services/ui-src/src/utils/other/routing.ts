import { LiteReport, Report } from "@rhtp/shared";

export const reportBasePath = (report: Report | LiteReport) => {
  return `/report/${report.type}/${report.state}/${report.id}`;
};
