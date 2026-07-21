import s3 from "../../libs/s3-lib";
import { handler } from "../../libs/handler-lib";
import { parseUploadParameters } from "../../libs/param-lib";
import { queryUpload } from "../../storage/upload";
import { forbidden, ok } from "../../libs/response-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { error } from "../../utils/constants";
import { getExtension, isAllowedFileExtension } from "@rhtp/shared";
import { validateFileContentMatchesExtension } from "../../utils/fileContentValidation";

const FILE_HEADER_BYTE_RANGE = "bytes=0-4100";

export const getUploadsByFileId = handler(
  parseUploadParameters,
  async (request) => {
    const { state, reportType, id, fileId } = request.parameters;

    const results = await queryUpload(fileId, state);
    if (!results.Items || results.Items.length === 0) {
      return forbidden(error.UNAUTHORIZED);
    }
    const document = results.Items[0];
    const extension =
      getExtension(document.filename) ?? getExtension(document.fileId);
    if (!extension || !isAllowedFileExtension(extension)) {
      return forbidden(error.UNAUTHORIZED);
    }

    const objectKey = `${reportType}/${state}/${id}/${document.fileId}`;
    let fileHeader: Uint8Array;
    try {
      const object = await s3.getObject({
        Bucket: process.env.attachmentsBucketName,
        Key: objectKey,
        Range: FILE_HEADER_BYTE_RANGE,
      });
      fileHeader = await object.Body!.transformToByteArray();
    } catch {
      return forbidden(error.UNAUTHORIZED);
    }

    const isValidContent = await validateFileContentMatchesExtension(
      fileHeader,
      extension
    );
    if (!isValidContent) {
      return forbidden(error.UNAUTHORIZED);
    }

    let psurl = await s3.getSignedDownloadUrl({
      Bucket: process.env.attachmentsBucketName,
      Key: objectKey,
      ResponseContentDisposition: `attachment; filename = ${document.filename}`,
    });
    psurl = fixLocalstackUrl(psurl);

    return ok({ psurl: psurl });
  }
);
