import {
  ReportState,
  PageStatus,
  ParentPageTemplate,
  ReportStatus,
} from "types";
import { pageIsCompletable } from "./reportLogic/completeness";

export const currentPageSelector = (state: ReportState) => {
  const { report, pageMap, currentPageId } = state;

  if (!report || !pageMap || !currentPageId) {
    return null;
  }

  const currentPage = report.pages[pageMap.get(currentPageId)!];
  return currentPage;
};

export const elementSelector = (elementId: string) => {
  return (state: ReportState) => {
    const currentPage = currentPageSelector(state);
    const element = currentPage?.elements?.find((el) => el.id === elementId);
    return element;
  };
};

export const currentPageCompletableSelector = (state: ReportState) => {
  if (!state.report || !state.currentPageId) return false;
  return pageIsCompletable(state.report, state.currentPageId);
};

export const submittableMetricsSelector = (state: ReportState) => {
  const { report, pageMap } = state;
  if (!report || !pageMap) {
    return null;
  }

  const childPages = (report.pages[pageMap.get("root")!] as ParentPageTemplate)
    .childPageIds;
  const sections = childPages.slice(0, -1).map((id) => {
    const pageIdx = pageMap.get(id);
    if (!pageIdx) return null;
    const section = report.pages[pageIdx] as ParentPageTemplate;
    // TODO: fix to actually check status and readiness to submit
    const displayStatus = PageStatus.IN_PROGRESS;
    const submittable = true;

    return {
      section: section,
      displayStatus: displayStatus,
      submittable: submittable,
    };
  });

  const allPagesSubmittable = sections.every(
    (sectionInfo) => !!sectionInfo?.submittable
  );
  const submittable =
    report.status !== ReportStatus.SUBMITTED && allPagesSubmittable;

  return { sections: sections, submittable: submittable };
};
