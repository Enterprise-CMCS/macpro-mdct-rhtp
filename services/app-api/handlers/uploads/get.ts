import s3 from "../../libs/s3-lib";
import { handler } from "../../libs/handler-lib";
import { parseUploadParameters } from "../../libs/param-lib";
import { queryUpload } from "../../storage/upload";
import { forbidden, ok } from "../../libs/response-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { error } from "../../utils/constants";

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
