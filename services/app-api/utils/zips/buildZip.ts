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
  UploadListProp,
} from "@rhtp/shared";
import s3Lib from "../../libs/s3-lib";
import JSZip from "jszip";
import {
  getReport,
  queryReportsByType,
  queryReportsForState,
} from "../../storage/reports";

export const formatS3ZipKey = (zipId: string) => `zips/${zipId}.zip`;

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
          `${state}/${report?.subType.toUpperCase()}/${folder.name}/${file.name}`,
          bytes
        );
      }
    }
  }
};

const ObligatedAndSpentFundsReportType = ReportType.RHTP;
export const addObligatedAndSpentFundsFilesToZip = async (
  reportSubTypeKeys: string[],
  zip: JSZip,
  state?: StateAbbr
) => {
  const obligatedAndSpentFundsFiles: {
    id: string;
    state: StateAbbr;
    subType: string;
    file: UploadListProp;
  }[] = [];
  const getObligatedAndSpentFundsFiles = (report: Report) => {
    const obligatedAndSpentFundsPage = report?.pages.find(
      (page) => page.id === "obligated-and-spent-funds"
    );
    const attachments =
      obligatedAndSpentFundsPage?.elements
        ?.filter(
          (element) =>
            element.type === ElementType.ObligatedAndSpentFundsAttachment
        )
        .flatMap((attachment) => attachment.answer)
        .filter((answer) => !!answer) ?? [];

    obligatedAndSpentFundsFiles.push({
      id: report.id,
      state: report.state,
      subType: report.subTypeKey,
      file: attachments[0],
    });
  };
  if (state) {
    const stateReports = await queryReportsForState(
      ObligatedAndSpentFundsReportType,
      state
    );
    const stateAndSubTypeReports = stateReports.filter((report) =>
      reportSubTypeKeys.includes(report.subTypeKey)
    );
    for (const report of stateAndSubTypeReports) {
      const { type, state, id } = report;
      const result = await getReport(type, state, id);
      if (!result) continue;
      getObligatedAndSpentFundsFiles(result);
    }
  } else {
    // already has pages
    const allReports = await queryReportsByType(
      ObligatedAndSpentFundsReportType
    );
    const subTypeReports = allReports.filter((report) =>
      reportSubTypeKeys.includes(report.subTypeKey)
    );
    for (const report of subTypeReports) {
      getObligatedAndSpentFundsFiles(report);
    }
  }
  for (const obligatedAndSpentFundsFile of obligatedAndSpentFundsFiles) {
    const { id, file, state, subType } = obligatedAndSpentFundsFile;
    if (!file?.fileId || !file?.name) continue;
    const item = await s3Lib.getObject({
      Bucket: process.env.attachmentsBucketName,
      Key: `${ObligatedAndSpentFundsReportType}/${state}/${id}/${file.fileId}`,
    });
    const bytes = await item.Body?.transformToByteArray();
    if (bytes) {
      zip.file(`${state}/${subType.toUpperCase()}/${file.name}`, bytes);
    }
  }
};
