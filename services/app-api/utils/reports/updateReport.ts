import { User } from "../../types/types";
import {
  AccordionGroupItem,
  AccordionGroupTemplate,
  CheckboxTemplate,
  ChoiceTemplate,
  DropdownTemplate,
  ElementType,
  PageElement,
  RadioTemplate,
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

export const updateChoiceTemplates = (
  choiceTemplates: ChoiceTemplate[],
  requestChoiceTemplates: ChoiceTemplate[]
) => {
  for (const choiceTemplate of choiceTemplates) {
    const requestTemplate = requestChoiceTemplates.find(
      (template) => template.label === choiceTemplate.label
    );
    if (
      !requestTemplate ||
      !choiceTemplate.checkedChildren ||
      !requestTemplate.checkedChildren
    )
      continue;
    updateElements(
      choiceTemplate.checkedChildren,
      requestTemplate.checkedChildren
    );
  }
};

export const updateElements = (
  elements: PageElement[],
  requestElements: PageElement[]
) => {
  for (const element of elements) {
    // Handle nested elements
    if (element.type == ElementType.AccordionGroup) {
      const newElement = requestElements.find(
        (newElement) => newElement.id === element.id
      ) as AccordionGroupTemplate;
      updateStatePolicyCommitments(element.accordions, newElement.accordions);
    }
    if (
      element.type == ElementType.Checkbox ||
      element.type == ElementType.Radio
    ) {
      const newElement = requestElements.find(
        (newElement) => newElement.id === element.id
      ) as CheckboxTemplate | RadioTemplate;
      updateChoiceTemplates(element.choices, newElement.choices);
    }
    if (element.type == ElementType.Dropdown) {
      const newElement = requestElements.find(
        (newElement) => newElement.id === element.id
      ) as DropdownTemplate;
      updateChoiceTemplates(element.options, newElement.options);
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
