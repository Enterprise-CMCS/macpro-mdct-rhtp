import s3 from "../../libs/s3-lib";
import { handler } from "../../libs/handler-lib";
import {
  parseUploadParameters,
  parseUploadViewParameters,
} from "../../libs/param-lib";
import { queryViewUploads, queryUpload } from "../../storage/upload";
import { forbidden, ok } from "../../libs/response-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { error } from "../../utils/constants";

export const viewUploadsForState = handler(
  parseUploadViewParameters,
  async (request) => {
    const { state } = request.parameters;

    const uploads = await queryViewUploads(state);
    return ok(uploads);
  }
);

export const getUpload = handler(parseUploadParameters, async (request) => {
  const { state, fileId } = request.parameters;
  if (!state || !fileId) {
    return forbidden(error.MISSING_DATA);
  }

  const results = await queryUpload(fileId, state);
  if (!results.Items || results.Items.length === 0) {
    return forbidden(error.UNAUTHORIZED);
  }
  const document = results.Items[0];

  // Pre-sign url
  let psurl = await s3.getSignedDownloadUrl({
    Bucket: process.env.attachmentsBucketName,
    Key: document.awsFilename as any,
    ResponseContentDisposition: `attachment; filename = ${document.filename}`,
  });
  psurl = fixLocalstackUrl(psurl);

  return ok({ psurl: psurl });
});
