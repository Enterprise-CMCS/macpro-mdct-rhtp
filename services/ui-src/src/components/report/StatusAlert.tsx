import { useStore } from "utils";
import { Alert } from "components/alerts/Alert";
import { PageElementProps } from "./Elements";
import {
  ElementType,
  PageElement,
  PageStatus,
  StatusAlertTemplate,
  cmsStatusThatLocksSPAC,
} from "@rhtp/shared";
import {
  currentPageSelector,
  submittableMetricsSelector,
} from "utils/state/selectors";
import { inferredReportStatus } from "utils/state/reportLogic/completeness";

const findElement = (
  elements: PageElement[] | undefined,
  watchId: string
): PageElement | undefined => {
  for (const element of elements ?? []) {
    if (element.id === watchId) return element;

    if (element.type === ElementType.AccordionGroup) {
      for (const accordion of element.accordions) {
        const nestedElement = findElement(accordion.elements, watchId);
        if (nestedElement) return nestedElement;
      }
    }
  }

  return undefined;
};

export const StatusAlert = (props: PageElementProps<StatusAlertTemplate>) => {
  const { report, currentPageId } = useStore();
  const { status, title, text } = props.element;

  const submittableMetrics = useStore(submittableMetricsSelector);
  const currentPage = useStore(currentPageSelector);

  if (!report || !currentPageId) return <></>;

  const isReviewPage = currentPageId === "review-submit";
  if (isReviewPage && submittableMetrics?.submittable) {
    return <></>;
  } else if (
    inferredReportStatus(report, currentPageId) !== PageStatus.COMPLETE
  ) {
    return <></>;
  }

  // by default alerts are active unless they are tied to an element id on the page
  // In that case they need to pass a custom conditional
  const isAlertActive = (watchId: string) => {
    const element = findElement(currentPage?.elements, watchId);

    if (element) {
      switch (element.id) {
        case "state-policy-commitments-group":
          return (
            element.type === ElementType.AccordionGroup &&
            element.accordions.length === 0
          );
        case "cms-status-evaluation":
          return (
            element.type === ElementType.Dropdown &&
            cmsStatusThatLocksSPAC.includes(element.answer ?? "")
          );
      }
    }
    return true;
  };

  if (props.element.for && !isAlertActive(props.element.for)) return;

  return (
    <Alert status={status} title={title}>
      {text}
    </Alert>
  );
};
