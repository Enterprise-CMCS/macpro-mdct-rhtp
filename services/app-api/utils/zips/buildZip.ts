import {
  AttachmentTableTemplate,
  AttachmentStatus,
  AccordionGroupTemplate,
  ElementType,
  AttachmentAreaTemplate,
  Report,
  PageElement,
  ReportType,
  StateAbbr,
} from "@rhtp/shared";
import s3Lib from "../../libs/s3-lib";
import JSZip from "jszip";

export const formatS3ReportZipKey = (
  reportType: ReportType,
  state: StateAbbr,
  id: string
) => `zips/${reportType}/${state}/${id}.zip`;

// sort relevant elements into an object to organize better
export const sortElementsForZip = (report: Report) =>
  report?.pages
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

// exclude initiative files with these statuses from the zip
const ignoreStatus = [
  AttachmentStatus.ARCHIVED,
  AttachmentStatus.INFORMATIONAL,
];
export const getInitiativeFiles = (element: AttachmentTableTemplate) =>
  element.answer
    ?.filter(({ status }) => !ignoreStatus.includes(status))
    .map(({ attachment }) => attachment) ?? [];

export const getAccordionFiles = (elements: AccordionGroupTemplate[]) => {
  const elementList = elements.flatMap((group) =>
    group.accordions.flatMap((accordions) => accordions.elements)
  ) as PageElement[];
  return getAttachmentAreaFiles(elementList);
};

export const getAttachmentAreaFiles = (elements: PageElement[]) =>
  elements
    .filter((element) => element.type === ElementType.AttachmentArea)
    .filter((element) => "answer" in element)
    .flatMap((group) => group.answer);

export const addReportFilesToZip = async (report: Report, zip: JSZip) => {
  const { id, type: reportType, state } = report;
  const sortedElements = sortElementsForZip(report);
  const zipFolders = [
    {
      name: "Initiatives",
      files: getInitiativeFiles(sortedElements?.initiative),
    },
    {
      name: "State Policy Commitments",
      files: getAccordionFiles(sortedElements?.accordions),
    },
    {
      name: "Sustainability and Highlights",
      files: getAttachmentAreaFiles(sortedElements?.area),
    },
  ];

  for (const folder of zipFolders) {
    for (const file of folder.files) {
      const item = await s3Lib.getObject({
        Bucket: process.env.attachmentsBucketName,
        Key: `${reportType}/${state}/${id}/${file?.fileId}`,
      });
      const bytes = await item.Body?.transformToByteArray();
      if (bytes && file?.name) {
        zip.file(
          `${state}/${report?.subType.toLowerCase()}/${folder.name}/${file.name}`,
          bytes
        );
      }
    }
  }
};
