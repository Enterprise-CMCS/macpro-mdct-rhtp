import { handler } from "../../libs/handler-lib";
import s3 from "../../libs/s3-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { queryUpload } from "../../storage/upload";
import { parseUploadParameters } from "../../libs/param-lib";
import { forbidden, ok } from "../../libs/response-lib";
import { error } from "../../utils/constants";

/**
 * Returns the report Sections associated with a given year and state
 */
export const getSignedFileUrl = handler(
  parseUploadParameters,
  async (request) => {
    const { state, fileId } = request.parameters;
    const { body } = request;
    if (!body || !fileId) {
      return forbidden(error.MISSING_DATA);
    }

    const results = await queryUpload(fileId, state!);
    if (!results.Items || results.Items.length === 0) {
      return forbidden(error.MISSING_DATA);
    }
    const document = results.Items[0];

    // Pre-sign url
    let psurl = await s3.getSignedDownloadUrl({
      Bucket: process.env.attachmentsBucketName,
      Key: document.awsFilename as any,
      ResponseContentDisposition: `attachment; filename = ${document.filename}`,
    });
    psurl = fixLocalstackUrl(psurl);

    return ok(psurl);
  },
);
