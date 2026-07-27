import { handler } from "../../libs/handler-lib";
import s3 from "../../libs/s3-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { parseFileUploadDownloadParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { updateUpload } from "../../storage/upload";
import { UploadFileData } from "../../types/uploads";
import KSUID from "ksuid";

export const createUpload = handler(
  parseFileUploadDownloadParameters,
  async (request) => {
    const { user, body } = request;
    const { state, reportType, id: reportId } = request.parameters;
    // Format Info
    const { uploadedFileName, uploadedFileSize } = body as UploadFileData;

    const username = user.email ?? "";
    const fileId = `${KSUID.randomSync().string}_${uploadedFileName}`;

    await updateUpload(
      state,
      username,
      uploadedFileName,
      fileId,
      uploadedFileSize
    );

    // Pre-sign url
    let psurl = await s3.createPresignedPost({
      Bucket: process.env.attachmentsBucketName,
      Key: `${reportType}/${state}/${reportId}/${fileId}`,
    });
    psurl = fixLocalstackUrl(psurl);
    return ok({ psurl, fileId });
  }
);
