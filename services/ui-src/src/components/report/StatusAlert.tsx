import { useStore } from "utils";
import { Alert } from "components/alerts/Alert";
import { PageElementProps } from "./Elements";
import { ElementType, StatusAlertTemplate } from "@rhtp/shared";
import { currentPageSelector } from "utils/state/selectors";
export const StatusAlert = (props: PageElementProps<StatusAlertTemplate>) => {
  const { report, currentPageId } = useStore();
  const { status, title, text } = props.element;
  const currentPage = useStore(currentPageSelector);

  if (!report || !currentPageId) return <></>;

  //by default alerts are active unless they are tied to an element on the page
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
