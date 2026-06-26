import {
  AttachmentTableTemplate,
  AttachmentStatus,
  AccordionGroupTemplate,
  ElementType,
  AttachmentAreaTemplate,
  Report,
} from "@rhtp/shared";

export const sortElementsForZip = (report: Report) => {
  //sort relevant elements into an object to organize better
  return report?.pages
    .flatMap((page) => page.elements)
    .reduce(
      (
        acc: {
          initiative: any;
          accordions: AccordionGroupTemplate[];
          area: AttachmentAreaTemplate[];
        },
        curr
      ) => {
        if (curr?.type === ElementType.AttachmentTable) {
          acc.initiative = curr;
        } else if (curr?.type === ElementType.AccordionGroup) {
          acc.accordions.push(curr);
        } else if (curr?.type === ElementType.AttachmentArea) {
          acc.area.push(curr);
        }
        return acc;
      },
      { initiative: {}, accordions: [], area: [] }
    );
};

export const getInitativeFiles = (element: AttachmentTableTemplate) => {
  //status of files to not add in the zip
  const ignoreStatus = [
    AttachmentStatus.ARCHIVED,
    AttachmentStatus.INFORMATIONAL,
  ];
  return (
    element.answer
      ?.filter((attachment) => !ignoreStatus.includes(attachment.status))
      ?.map((answer) => answer.attachment) ?? []
  );
};

export const getAccordionFiles = (elements: AccordionGroupTemplate[]) => {
  const accordionGroups = elements
    .flatMap((group) =>
      group.accordions.flatMap((accordions) => accordions.elements)
    )
    .filter((element) => element.type === ElementType.AttachmentArea)
    .filter((element) => "answer" in element);
  return accordionGroups.flatMap((group) => group.answer) ?? [];
};

export const getSustainabilityAndHighlightFiles = (
  elements: AttachmentAreaTemplate[]
) => {
  const attachAreaIds = ["success-attachments", "sustainability-attachments"];
  return elements
    .filter(
      (element) => attachAreaIds.includes(element.id) && "answer" in element
    )
    .flatMap((element) => element.answer);
};
