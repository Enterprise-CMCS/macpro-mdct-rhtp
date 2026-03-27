import KSUID from "ksuid";
import { getReportTemplate } from "../../forms/yearlyFormSelection";
import {
  Report,
  ReportStatus,
  ReportOptions,
  ReportType,
  ParentPageTemplate,
  FormPageTemplate,
  ReviewSubmitTemplate,
  RhtpSubType,
} from "../../types/reports";
import { User } from "../../types/types";
import { validateReportPayload } from "../reportValidation";
import { logger } from "../../libs/debug-lib";
import { StateAbbr } from "../constants";
import { copyReport } from "./copyReport";

export const makeQuarterlyChanges = (
  pages: (ParentPageTemplate | FormPageTemplate | ReviewSubmitTemplate)[]
) => {
  for (const page of pages) {
    if (!page.elements) continue;
    for (const element of page.elements) {
      if ("quarterly" in element && !element.quarterly) {
        element.disabled = true;
      }
    }
  }
};

export const buildReport = async (
  reportType: ReportType,
  state: StateAbbr,
  reportOptions: ReportOptions,
  user: User
) => {
  const year = reportOptions.year;
  // json parse and stringify used instead of structuredClone to break shared references between repeat elements
  const template = JSON.parse(
    JSON.stringify(getReportTemplate(reportType, year, state))
  );

  const report: Report = {
    state,
    id: KSUID.randomSync().string,
    created: Date.now(),
    lastEdited: Date.now(),
    lastEditedBy: user.fullName,
    lastEditedByEmail: user.email,
    type: reportType,
    status: ReportStatus.NOT_STARTED,
    name: reportOptions.name,
    year: reportOptions.year,
    subType: reportOptions.subType,
    copyFromReportId: reportOptions.copyFromReportId,
    submissionCount: 0,
    pages: template.pages,
  };

  if (report.subType !== RhtpSubType.ANNUAL) {
    makeQuarterlyChanges(report.pages);
  }

  if (report.copyFromReportId) {
    await copyReport(report);
  }

  /**
   * Report should always be valid in this function, but we're going
   * to send it through the report validator for a sanity check
   */
  let validatedReport: Report | undefined;
  try {
    validatedReport = await validateReportPayload(report);
  } catch (error) {
    logger.error(error);
    throw new Error("Invalid request");
  }

  return validatedReport;
};
