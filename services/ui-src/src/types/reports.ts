export * from "@rhtp/shared";

import {
  type ParentPageTemplate,
  type FormPageTemplate,
  type InitiativePageTemplate,
  type ReviewSubmitTemplate,
  PageType,
} from "@rhtp/shared";

export const getReportName = (type: string | undefined) => {
  switch (type) {
    default:
      return "RHTP";
  }
};

export type PageTemplate =
  | ParentPageTemplate
  | FormPageTemplate
  | InitiativePageTemplate
  | ReviewSubmitTemplate;

export interface PageData {
  parent: string;
  childPageIds: string[];
  index: number;
}

export const isReviewSubmitPage = (
  page: PageTemplate
): page is ReviewSubmitTemplate => {
  return page.type === PageType.ReviewSubmit && "submittedView" in page;
};

export const isFormPageTemplate = (
  page: PageTemplate
): page is FormPageTemplate => {
  return (page as FormPageTemplate).title != undefined;
};

/**
 * Instructs Typescript to complain if it detects that this function may be reachable.
 * Useful for the default branch of a switch statement that verifiably covers every case.
 */
export const assertExhaustive = (_: never): void => {};
