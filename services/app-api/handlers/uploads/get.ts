import s3 from "../../libs/s3-lib";
import { handler } from "../../libs/handler-lib";
import { parseUploadFiles, parseUploadParameters } from "../../libs/param-lib";
import { queryUpload } from "../../storage/upload";
import { forbidden, ok } from "../../libs/response-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { error } from "../../utils/constants";
import { getReport as getReportFromDatabase } from "../../storage/reports";
import { ElementType } from "@rhtp/shared";
import JSZip from "jszip";
import { Readable } from "node:stream";

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
      (file) => file != undefined
    );

    const zip = new JSZip();
    for (const file of files) {
      const item = await s3.getObject({
        Bucket: process.env.attachmentsBucketName,
        Key: `${reportType}/${state}/${id}/${file?.fileId}`,
      });
      const bytes = await item.Body?.transformToByteArray();
      if (bytes && file?.name) {
        zip.file(`${state}/${report?.subTypeKey}/${file.name}`, bytes);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const zipKey = `zips/${reportType}/${state}/${id}.zip`;
    await s3.putObject({
      Bucket: process.env.attachmentsBucketName,
      Key: zipKey,
      Body: Readable.from(zipBuffer),
      ContentLength: zipBuffer.byteLength,
      ContentType: "application/zip",
    });

    let psurl = await s3.getSignedDownloadUrl({
      Bucket: process.env.attachmentsBucketName,
      Key: zipKey,
      ResponseContentDisposition: `attachment; filename=RHTP_${state}_${report?.subTypeKey}.zip`,
    });
    psurl = fixLocalstackUrl(psurl);

    return ok({ psurl });
  }
);
