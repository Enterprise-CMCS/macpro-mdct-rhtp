import s3 from "../../libs/s3-lib";
import { handler } from "../../libs/handler-lib";
import { parseUploadFiles, parseUploadParameters } from "../../libs/param-lib";
import { queryUpload } from "../../storage/upload";
import { forbidden, ok } from "../../libs/response-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { error } from "../../utils/constants";
import { getReport as getReportFromDatabase } from "../../storage/reports";
import { ElementType } from "@rhtp/shared";

export const getUploadsByFileId = handler(
  parseUploadParameters,
  async (request) => {
    const { state, reportType, id, fileId } = request.parameters;

    const results = await queryUpload(fileId, state);
    if (!results.Items || results.Items.length === 0) {
      return forbidden(error.UNAUTHORIZED);
    }
    const document = results.Items[0];

    // Pre-sign url
    let psurl = await s3.getSignedDownloadUrl({
      Bucket: process.env.attachmentsBucketName,
      Key: `${reportType}/${state}/${id}/${document.fileId}`,
      ResponseContentDisposition: `attachment; filename = ${document.filename}`,
    });
    psurl = fixLocalstackUrl(psurl);

    return ok({ psurl: psurl });
  }
);

export const getUploadsByReportId = handler(
  parseUploadFiles,
  async (request) => {
    const { state, reportType, id } = request.parameters;
    if (!state || !reportType || !id) {
      return forbidden(error.MISSING_DATA);
    }

    //Getting the file list from the reports so that we don't return any orphan files in the folder
    const report = await getReportFromDatabase(reportType, state, id);
    const flattenElements = report?.pages.flatMap((page) => page.elements);

    const initAttachment = flattenElements?.find(
      (element) => element?.type === ElementType.AttachmentTable
    );
    const initAttachmentFiles =
      initAttachment?.answer?.map((answer) => answer.attachment) ?? [];

    const accordionGroups = flattenElements
      ?.filter((element) => element?.type === ElementType.AccordionGroup)
      .flatMap((group) =>
        group.accordions.flatMap((accordions) => accordions.children)
      )
      .filter((element) => element.type === ElementType.AttachmentArea);

    const accordionFiles =
      accordionGroups?.flatMap((group) => group.answer) ?? [];

    const files = [...initAttachmentFiles, ...accordionFiles].filter(
      (files) => files != undefined
    );

    const s3Objects = [];
    for (var i = 0; i < files.length; i++) {
      const file = files[i]?.fileId;
      const item = await s3.getObject({
        Bucket: process.env.attachmentsBucketName,
        Key: `${reportType}/${state}/${id}/${file}`,
      });
      s3Objects.push(item);
    }

    const data = [];
    for (var j = 0; j < s3Objects.length; j++) {
      const item = await s3Objects[j].Body?.transformToString("base64");
      data.push({ name: files[j]?.name, bytes: item });
    }
    return ok(data);
  }
);
