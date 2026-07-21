import { User } from "../../types/types";
import {
  AccordionGroupItem,
  AccordionGroupTemplate,
  PageElement,
  Report,
  ReportStatus,
} from "@rhtp/shared";
import { getReport as getReportFromDatabase } from "../../storage/reports";

export const updateStatePolicyCommitments = (
  accordions: AccordionGroupItem[],
  requestAccordions: AccordionGroupItem[]
) => {
  for (const accordionItem of accordions) {
    const requestAccordionItem = requestAccordions.find(
      (newAccordionItem) => newAccordionItem.label === accordionItem.label
    );
    if (!requestAccordionItem) continue;
    updateElements(accordionItem.elements, requestAccordionItem.elements);
  }
};

export const updateElements = (
  elements: PageElement[],
  requestElements: PageElement[]
) => {
  for (const element of elements) {
    // Handle nested elements
    if ("accordions" in element) {
      const newElement = requestElements.find(
        (newElement) => newElement.id === element.id
      ) as AccordionGroupTemplate;
      updateStatePolicyCommitments(element.accordions, newElement.accordions);
    }

    const requestElement = requestElements.find(
      (newElement) => newElement.id === element.id
    );
    if (!requestElement || !("answer" in requestElement)) {
      continue;
    }

    if (requestElement?.type === element.type) {
      element.answer = requestElement.answer;
    }
  }
};

export const updateReportAnswers = async (
  reportRequest: Report,
  user: User
) => {
  const { id, pages: newPages, state, type } = reportRequest;

  const report = await getReportFromDatabase(type, state, id!);
  if (!report) return;

  report.status = ReportStatus.IN_PROGRESS;
  report.lastEdited = Date.now();
  report.lastEditedBy = user.fullName;

  for (const page of report.pages) {
    let requestPage = newPages.find((newPage) => newPage.id === page.id);

    if (!page.elements || !requestPage || !requestPage.elements) continue;
    updateElements(page.elements, requestPage.elements);
  }
  return report;
};
