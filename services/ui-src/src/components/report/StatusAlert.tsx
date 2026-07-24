import { useStore } from "utils";
import { Alert } from "components/alerts/Alert";
import { PageElementProps } from "./Elements";
import { ElementType, PageStatus, StatusAlertTemplate } from "@rhtp/shared";
import {
  currentPageSelector,
  submittableMetricsSelector,
} from "utils/state/selectors";
import { inferredReportStatus } from "utils/state/reportLogic/completeness";
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

  const isAlertActive = (watchId: string) => {
    const element = currentPage?.elements?.find(
      (element) => element.id === watchId
    );
    if (element) {
      switch (element.type) {
        case ElementType.AccordionGroup:
          return element.accordions.length === 0;
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
