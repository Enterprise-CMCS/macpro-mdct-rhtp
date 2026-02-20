import { LiteReport, Report } from "types";

export const reportBasePath = (report: Report | LiteReport) => {
  return `/report/${report.type}/${report.state}/${report.id}`;
};
