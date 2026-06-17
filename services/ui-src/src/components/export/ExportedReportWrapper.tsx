import { Flex } from "@chakra-ui/react";
import { ElementType, PageElement, ReportPage } from "@rhtp/shared";
import { renderElements, shouldUseTable } from "./ExportedReportElements";
import { chunkBy } from "utils/other/arrays";
import { ExportedReportTable, ReportTableType } from "./ExportedReportTable";

export const renderReportTable = (elements: ReportTableType[] | undefined) => {
  const filteredElements = elements?.filter((element) => element.indicator);
  if (filteredElements?.length == 0) return;

  return <ExportedReportTable rows={filteredElements!}></ExportedReportTable>;
};

export const renderReportDisplay = (
  elements: ReportTableType[] | undefined
) => {
  return elements?.map((element: ReportTableType) => element.response);
};

export const renderExpandedAnswers = (element: PageElement) => {
  if (!("answer" in element) || !element.answer) return element;

  switch (element.type) {
    case ElementType.ListInput:
    case ElementType.AttachmentArea:
      return element.answer?.map(
        (item, index) =>
          ({
            type: element.type,
            label: `${element.label}  ${index + 1}`,
            helperText: element.helperText,
            answer: [item],
          }) as any
      );
  }
  return element;
};

// Render helper text only if it exists and is not a warning.
const getHelperText = (element: PageElement) => {
  if (!("helperText" in element)) return "";
  if (!element.helperText) return "";
  if (element.helperText.includes("Warning:")) return "";
  return element.helperText;
};

export const ExportedReportWrapper = ({ section }: Props) => {
  const uniqueElements = "checkpoint-table";

  const filteredElements = section.elements?.filter((element) => {
    const hasAnswer =
      "answer" in element &&
      element.answer !== undefined &&
      element.answer !== "";
    const isRequired = !("required" in element) || element.required !== false;
    return hasAnswer || isRequired || uniqueElements.includes(element.id);
  });

  if (filteredElements == undefined) return null;

  const expandCheckedChildren = (elements: PageElement[]): PageElement[] => {
    return elements.flatMap((element) => {
      if ("choices" in element) {
        const checkedChoice = element.choices.find(
          (choice) => choice.value === element.answer
        );

        // Note that from this point on, the answer is a label and not a key.
        element.answer = checkedChoice?.label;

        // A radio element is immediately followed by all of its child elements.
        return [
          element,
          ...expandCheckedChildren(checkedChoice?.checkedChildren ?? []),
        ];
      } else if (element.type === ElementType.AccordionGroup) {
        const expandedElements: PageElement[] = [];
        for (const accordion of element.accordions) {
          expandedElements.push({
            id: accordion.label,
            text: accordion.label,
            type: ElementType.SubHeader,
          });
          const childElements = accordion.elements.flatMap((element) =>
            renderExpandedAnswers(element)
          );
          expandedElements.push(...childElements);
        }
        return expandedElements;
      } else {
        // All other element types stand on their own.
        return [element];
      }
    });
  };

  const expandedElements = expandCheckedChildren(filteredElements);

  const elements =
    expandedElements?.map((element) => {
      return {
        indicator: "label" in element ? (element.label ?? "") : "",
        helperText: getHelperText(element),
        response: renderElements(element),
        type: element.type ?? "",
        required: "required" in element ? element.required : false,
      };
    }) ?? [];

  /*
   * Split the elements array into subarrays.
   * Within each subarray, either all elements belong in a table, or none do.
   * Order is preserved: flattening the chunked array would give the original.
   */
  const chunkedElements = chunkBy(elements, (el) => shouldUseTable(el.type));

  return (
    <Flex flexDir="column" gap="1.5rem">
      {chunkedElements.length > 0 && (
        <>
          {chunkedElements.map((elements, index) => (
            <div key={`element-${index}`}>
              {shouldUseTable(elements[0].type)
                ? renderReportTable(elements)
                : renderReportDisplay(elements)}
            </div>
          ))}
        </>
      )}
    </Flex>
  );
};

export interface Props {
  section: ReportPage;
}
