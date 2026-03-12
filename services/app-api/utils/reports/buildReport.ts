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
  PageType,
} from "../../types/reports";
import { User } from "../../types/types";
import { validateReportPayload } from "../reportValidation";
import { logger } from "../../libs/debug-lib";
import { StateAbbr } from "../constants";
import { copyReport } from "./copyReport";
import {
  initiativeHeader,
  initiativeInstructions,
  initiativeInstructionsAccordion,
  initiativeNarrative,
  initiativeNumberOfPeopleServed,
  returnToInitiativesDashboard,
} from "../../forms/2026/elements";
import { Initiatives } from "../../forms/2026/rhtp/rhtp";
import {
  checkpointsTables,
  metricTable,
} from "../../forms/2026/rhtp/rhtpElements";

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

export const buildInitiativePages = (report: Report) => {
  for (const [id, title] of Object.entries(Initiatives)) {
    report.pages.push({
      id,
      title,
      type: PageType.Standard,
      sidebar: false,
      elements: [
        returnToInitiativesDashboard,
        initiativeHeader(title),
        initiativeInstructions,
        initiativeInstructionsAccordion,
        initiativeNarrative,
        initiativeNumberOfPeopleServed,
        metricTable,
        ...checkpointsTables,
      ],
    });
  }
};

export const buildReport = async (
  reportType: ReportType,
  state: StateAbbr,
  reportOptions: ReportOptions,
  user: User
) => {
  const year = reportOptions.year;
  const template = structuredClone(getReportTemplate(reportType, year));

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
    archived: false,
    submissionCount: 0,
    pages: template.pages,
  };

  if (report.subType !== RhtpSubType.ANNUAL) {
    makeQuarterlyChanges(report.pages);
  }

  buildInitiativePages(report);

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
