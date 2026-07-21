import KSUID from "ksuid";
import {
  Report,
  ReportStatus,
  ReportOptions,
  ReportType,
  RhtpSubType,
  StateAbbr,
  ReportPages,
  optionalInQuarterly,
} from "@rhtp/shared";
import { User } from "../../types/types";
import { validateReportPayload } from "../reportValidation";
import { logger } from "../../libs/debug-lib";
import { copyReport } from "./copyReport";

//there are certain elements that change from being required to optional when going from annual to quarterly

export const makeQuarterlyChanges = (pages: ReportPages) => {
  for (const page of pages) {
    if (!page.elements) continue;
    for (const element of page.elements) {
      if ("quarterly" in element && !element.quarterly) {
        element.disabled = true;
        element.required = false;
      }
      if (optionalInQuarterly.includes(element.id) && "required" in element) {
        element.required = false;
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
  const pages = JSON.parse(JSON.stringify(reportOptions.pages)); // remove object references to prevent modifying shared objects

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
    subType: reportOptions.subType,
    subTypeKey: reportOptions.subTypeKey,
    budgetPeriod: reportOptions.budgetPeriod,
    copyFromReportId: reportOptions.copyFromReportId,
    submissionCount: 0,
    pages,
  };

  if (report.subType === RhtpSubType.QUARTERLY) {
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
