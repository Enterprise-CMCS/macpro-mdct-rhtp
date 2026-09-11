import s3 from "../../libs/s3-lib";
import { handler } from "../../libs/handler-lib";
import {
  parseDataSetFileUploadParameters,
  parseDataSetFileUploadDownloadParameters,
  emptyParser,
} from "../../dataSets/libs/param-lib";
import {
  queryUpload,
  queryStateUpload,
  queryViewUploads,
} from "../../storage/datasetUpload";
import { forbidden, ok } from "../../libs/response-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { error } from "../../utils/constants";
import { getExtension, isAllowedFileExtension } from "@rhtp/shared";
import { validateFileContentMatchesExtension } from "../../utils/fileContentValidation";
import { canReadState } from "../../utils/authorization";

const FILE_HEADER_BYTE_RANGE = "bytes=0-4100";

/**
 * This is for downloading the file stored in S3 bucket
 */
export const getDataSetUploadsByFileId = handler(
  parseDataSetFileUploadDownloadParameters,
  async (request) => {
    const { state, id: datasetId, fileId } = request.parameters;

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

    const objectKey = `${datasetId}/${state}/${document.fileId}`;
    let fileHeader: Uint8Array;
    try {
      const object = await s3.getObject({
        Bucket: process.env.datasetBucketName,
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
      Bucket: process.env.datasetBucketName,
      Key: objectKey,
      ResponseContentDisposition: `attachment; filename = ${document.filename}`,
    });
    psurl = fixLocalstackUrl(psurl);

    return ok({ psurl: psurl });
  }
);

/**
 * get file uploaded by state
 */
export const getUploadsByState = handler(
  parseDataSetFileUploadParameters,
  async (request) => {
    const { state } = request.parameters;
    const { user } = request;

    if (!canReadState(user, state)) {
      return forbidden(error.UNAUTHORIZED);
    }

    const uploads = await queryStateUpload(state);

    return ok(uploads);
  }
);

/**
 * get all file uploaded, used for admin dashboard
 */
export const getDataSetUploads = handler(emptyParser, async (request) => {
  const { user } = request;

  if (!canReadState(user, user.state!)) {
    return forbidden(error.UNAUTHORIZED);
  }

  const uploads = await queryViewUploads();
  return ok(uploads);
});
