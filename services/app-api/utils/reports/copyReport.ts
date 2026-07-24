import { batchPutComments, queryComments } from "../../storage/comments";
import { getReport as getReportFromDatabase } from "../../storage/reports";
import {
  ActionAnswerShape,
  PageElement,
  Report,
  RhtpSubType,
  AccordionGroupItem,
  AccordionGroupTemplate,
  AttachmentTableTemplate,
  Comment,
  ElementType,
  PageStatus,
} from "@rhtp/shared";
import KSUID from "ksuid";
import { queryUpload, batchPutUploads } from "../../storage/upload";
import { UploadData } from "../../types/uploads";
import s3 from "../../libs/s3-lib";

const SKIP_COPY_ANSWER_IDS = [
  "obligated-and-spent-funds-attachment",
  "initiative-narrative",
];

const SKIP_COPY_PAGE_IDS = ["sustainability-and-highlights"];

const copyStatePolicyCommitments = (
  oldAccordions: AccordionGroupItem[],
  newAccordions: AccordionGroupItem[]
) => {
  for (const oldAccordionItem of oldAccordions) {
    for (const oldChildItem of oldAccordionItem.elements) {
      if ("answer" in oldChildItem) {
        const newAccordionItem = newAccordions.find(
          (newAccordionItem) =>
            newAccordionItem.label === oldAccordionItem.label
        );

        const newChildItem = newAccordionItem?.elements.find(
          (newChildItem) => newChildItem.id === oldChildItem.id
        ) as PageElement;
        if (oldChildItem?.type === newChildItem.type) {
          newChildItem.answer = structuredClone(oldChildItem.answer);
        }
      }
    }
  }
};

const copyAnswer = (
  oldElements: PageElement[],
  newElements: PageElement[],
  newSubType: RhtpSubType,
  status?: PageStatus
) => {
  for (const oldElement of oldElements) {
    // Copying over State Policy Commitments
    if ("accordions" in oldElement) {
      const newElement = newElements.find(
        (newElement) => newElement.id === oldElement.id
      ) as AccordionGroupTemplate;
      copyStatePolicyCommitments(oldElement.accordions, newElement.accordions);
    }

    const newElement = newElements.find(
      (newElement) => newElement.id === oldElement.id
    );
    // when copying, don't use pre-filled answers
    if (newElement && "answer" in newElement) {
      delete newElement.answer;
    }
    // disable all elements in an abandoned page
    if (status === PageStatus.ABANDONED) {
      (newElement as any).disabled = true;
    }
    if (!("answer" in oldElement)) {
      continue;
    }
    if (newElement?.type === oldElement.type) {
      //special copy of metrics table when it's a new annual report
      if (
        newElement.id === "metrics-table" &&
        newSubType === RhtpSubType.ANNUAL
      ) {
        newElement.answer = copyMetricAnswers(
          oldElement.answer as ActionAnswerShape[]
        );
      } else if (SKIP_COPY_ANSWER_IDS.includes(newElement.id)) {
        delete newElement.answer;
      } else {
        newElement.answer = oldElement.answer;
      }
    }
  }
};

const copyMetricAnswers = (oldAnswerRows: ActionAnswerShape[]) => {
  return oldAnswerRows.map((oldAnswerRow) => {
    const newAnswerRow = structuredClone(oldAnswerRow);
    const indexes = ["prevValue", "currValue"].map((key) =>
      oldAnswerRow.findIndex((row) => row.id === key)
    );
    newAnswerRow[indexes[0]].value = oldAnswerRow[indexes[1]].value;
    newAnswerRow[indexes[1]].value = "";
    return newAnswerRow;
  });
};

// Initiative attachments: YES
// State policy commitment attachments: YES
// Obligated and spent funds attachment: NO
// Sustainability attachments: NO
// (subject to change)
export const copyAttachmentsAndTheirComments = async (newReport: Report) => {
  const { pages, copyFromReportId, state, type, id } = newReport;
  const uploadsToCopy = [];

  // Initiative attachments
  const initiativeAttachmentsPage = pages.find(
    (page) => page.id === "initiative-attachments"
  );
  const initiativeAttachmentsTable = initiativeAttachmentsPage?.elements?.find(
    (element) => element.id === "initiative-attachments-table"
  ) as AttachmentTableTemplate;

  if (!initiativeAttachmentsTable?.answer) return;

  if ("answer" in initiativeAttachmentsTable) {
    for (const answer of initiativeAttachmentsTable.answer) {
      const newFileId = `${KSUID.randomSync().string}_${answer.attachment.name}`;
      uploadsToCopy.push({
        fileId: newFileId,
        previousReportId: copyFromReportId,
        previousFileId: answer.attachment.fileId,
        uploadedState: state,
      });

      // mutating the answer to new fileId
      answer.attachment.fileId = newFileId;
    }
  }

  // State policy commitment attachments
  const statePolicyCommitmentsPage = pages.find(
    (page) => page.id === "state-policy-commitments"
  );
  const statePolicyGroup = statePolicyCommitmentsPage?.elements?.find(
    (element) => element.id === "state-policy-commitments-group"
  ) as AccordionGroupTemplate;
  for (const accordion of statePolicyGroup.accordions) {
    for (const element of accordion.elements) {
      if (element.type === ElementType.AttachmentArea && "answer" in element) {
        for (const answer of element.answer!) {
          const newFileId = `${KSUID.randomSync().string}_${answer.name}`;
          uploadsToCopy.push({
            fileId: newFileId,
            previousReportId: copyFromReportId,
            previousFileId: answer.fileId,
            uploadedState: state,
          });

          // mutating the answer to new fileId
          answer.fileId = newFileId;
        }
      }
    }
  }

  const uploadsToBatchPut: UploadData[] = [];
  const commentsToBatchPut: Comment[] = [];

  // Update uploads in DynamoDB and copy files in S3
  // and prepare its comments to be copied
  for (const upload of uploadsToCopy) {
    const results = await queryUpload(
      upload.previousFileId,
      upload.uploadedState
    );
    if (!results.Items || results.Items.length === 0) {
      console.error(
        `No upload found for fileId: ${upload.previousFileId} and state: ${upload.uploadedState}`
      );
      continue;
    }

    const previousUpload = results.Items[0];
    uploadsToBatchPut.push({
      ...previousUpload,
      ...upload,
    } as UploadData);

    await s3.copyObject({
      Bucket: process.env.attachmentsBucketName,
      CopySource: `${process.env.attachmentsBucketName}/${type}/${state}/${copyFromReportId}/${previousUpload.fileId}`,
      Key: `${type}/${state}/${id}/${upload.fileId}`,
    });

    const comments = await queryComments(previousUpload.fileId, true);
    if (comments && comments.length > 0) {
      for (const comment of comments) {
        commentsToBatchPut.push({
          ...comment,
          contextId: upload.fileId,
          parentReportId: id,
        });
      }
    }
  }

  await batchPutUploads(uploadsToBatchPut);
  await batchPutComments(commentsToBatchPut);
};

export const copyReport = async (newReport: Report) => {
  const { copyFromReportId, pages: newPages, state, type, subType } = newReport;
  const reportToCopy = await getReportFromDatabase(
    type,
    state,
    copyFromReportId!
  );
  if (!reportToCopy) return;

  for (const oldPage of reportToCopy.pages) {
    if (SKIP_COPY_PAGE_IDS.includes(oldPage.id)) continue;
    if (oldPage.elements) {
      let newPage = newPages.find((newPage) => newPage.id === oldPage.id);
      // ensure initiatives not in base template get copied
      if (!newPage && "initiativeNumber" in oldPage) {
        newPages.push(oldPage);
        newPage = oldPage;
      }

      const newElements = newPage?.elements;
      if (!newElements) continue;

      if (newPage && newPage.status !== oldPage.status) {
        newPage.status = oldPage.status;
      }

      copyAnswer(oldPage.elements, newElements, subType, newPage?.status);
    }
  }

  await copyAttachmentsAndTheirComments(newReport);
};
