/**
 * Logic pertaining to what it means to be completable, by page and report.
 */
import {
  ElementType,
  HideCondition,
  PageElement,
  PageStatus,
  Report,
} from "@rhtp/shared";
import { isFormPageTemplate, assertExhaustive } from "types";
import { isEmail } from "utils/validation/inputValidation";

/**
 * Calculate the status of any page, including calculated values.
 * Special consideration for pages that calculate their display-only status based off many pages.
 * Returns an implied status for pages like the general page that don't have a manual click.
 * @param report
 * @param pageId
 * @returns
 */
export const inferredReportStatus = (report: Report, pageId: string) => {
  // Manual signoff pages
  const targetPage = report.pages.find((page) => page.id === pageId);
  if (!targetPage) return;
  if (isFormPageTemplate(targetPage) && targetPage.status)
    return targetPage.status;

  // inferred pages
  if (pageIsCompletable(report, pageId)) return PageStatus.COMPLETE;
  return pageInProgress(report, pageId)
    ? PageStatus.IN_PROGRESS
    : PageStatus.NOT_STARTED;
};

// Check to see if a page has been dirtied if it is not keeping a signoff status
export const pageInProgress = (report: Report, pageId: string) => {
  const targetPage = report.pages.find((page) => page.id === pageId);
  if (!targetPage) return false;
  if (!targetPage.elements) return true;

  const hasData = (answerPart: string | number | object | undefined) => {
    if (answerPart === undefined || answerPart === null) {
      // null and undefined are not data
      return false;
    } else if (typeof answerPart === "number") {
      // Zero would be considered data, as would any other number
      return true;
    } else if (typeof answerPart === "string") {
      // An empty string would not be data, but any other string would be.
      return answerPart !== "";
    } else if (Array.isArray(answerPart)) {
      // An array only has data if some element of the array is data.
      return answerPart.some(hasData);
    } else if (typeof answerPart === "object") {
      // An object only has data if one of its properties is data.
      return Object.values(answerPart).some(hasData);
    } else {
      // It shouldn't be possible to reach this code branch.
      assertExhaustive(answerPart);
      // But if some value somehow does make it here, let's call it data.
      return true;
    }
  };

  const anyEdited = targetPage.elements.find(
    (element) => "answer" in element && hasData(element.answer)
  );
  return !!anyEdited;
};

/**
 * Returns whether a given page can be considered completable.
 * For elements without a status this means they can be considered complete enough to submit, such as General Info.
 * @param report
 * @param pageId
 * @returns Completable status.
 */
export const pageIsCompletable = (report: Report, pageId: string) => {
  const targetPage = report.pages.find((page) => page.id === pageId);
  if (!targetPage) return false;
  if (!targetPage.elements) return true;

  //Check initiative pages separately
  if (pageId === "initiatives") {
    const initiativePages = report.pages.filter(
      (page) => "initiativeNumber" in page && page.status !== "Abandoned"
    );
    for (const page of initiativePages) {
      for (const element of page.elements!) {
        const satisfied = elementSatisfiesRequired(
          element,
          targetPage.elements
        );
        if (!satisfied) return false;
      }
    }
  } else {
    for (const element of targetPage.elements) {
      if (element.type === ElementType.AccordionGroup) {
        const accordionElements = element.accordions.flatMap(
          (accordion) => accordion.elements
        );
        for (const element of accordionElements) {
          const satisfied = elementSatisfiesRequired(
            element,
            targetPage.elements
          );
          if (!satisfied) return false;
        }
      } else {
        const satisfied = elementSatisfiesRequired(
          element,
          targetPage.elements
        );
        if (!satisfied) return false;
      }
    }
  }

  return true;
};

export const elementSatisfiesRequired = (
  element: PageElement,
  pageElements: PageElement[]
) => {
  //while list input is not required, if the user adds a field and leaves it blank, that would make it incomplete and prevent form submission
  if (
    element.type === ElementType.ListInput &&
    element.answer?.some((item) => item === "" || item === undefined)
  ) {
    return false;
  }

  // TODO: make less ugly
  if (
    !("required" in element) ||
    !element.required ||
    ("hideCondition" in element &&
      elementIsHidden(element.hideCondition, pageElements))
  ) {
    return true;
  }
  if (!("answer" in element) || !element.answer) {
    // TODO: number fields are currently represented as strings, need to be handled here when fixed
    return false;
  }
  // Special handling - nested children
  if (element.type === ElementType.Radio) {
    for (const choice of element.choices) {
      if (choice.value !== element.answer || !choice.checkedChildren) continue;
      for (const childElement of choice.checkedChildren) {
        const satisfied = elementSatisfiesRequired(childElement, pageElements);
        if (!satisfied) return false;
      }
    }
  }
  if (
    element.type === ElementType.ActionTable &&
    element.id === "metrics-table"
  ) {
    //only get metric rows that haven't been abandoned
    const activeElements = element.answer
      .filter((rows) =>
        rows.find(
          (column) => column.id === "status" && column.value !== "Abandoned"
        )
      )
      .flat();
    const answers = activeElements.filter(
      (column) => column.id != "prevValue" && column.id != "no"
    );
    return answers.every((column) => column.value !== "");
  }
  if (element.type == ElementType.ObligatedAndSpentFundsAttachment) {
    return element.answer.length > 0;
  }
  if (element.id.includes("email") && typeof element.answer === "string") {
    return isEmail(element.answer);
  }

  return true;
};

export const elementIsHidden = (
  hideCondition: HideCondition | undefined,
  elements: Partial<PageElement>[]
) => {
  if (!hideCondition) return false;

  const controlElement = elements.find((target: any) => {
    return target?.id === hideCondition?.controllerElementId;
  });
  return (
    !!controlElement &&
    "answer" in controlElement &&
    controlElement.answer === hideCondition?.answer
  );
};
