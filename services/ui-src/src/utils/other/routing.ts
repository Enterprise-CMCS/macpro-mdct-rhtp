import { LiteReport, Report } from "@rhtp/shared";

export const reportBasePath = (report: Report | LiteReport) => {
  return `/report/${report.type}/${report.state}/${report.id}`;
};

// navigate to path from clicked link if exists
export const getReturnUrl = () => {
  const returnUrl = localStorage.getItem("ReturnURL") ?? "/";
  localStorage.removeItem("ReturnURL");
  return returnUrl;
};
