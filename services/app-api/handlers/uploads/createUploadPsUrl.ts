import { handler } from "../../libs/handler-lib";
import s3 from "../../libs/s3-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { parseUploadViewParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { createUpload } from "../../storage/upload";
import { UploadFileData } from "../../types/uploads";
import KSUID from "ksuid";
/**
 * Updates the Sections associated with a given year and state
 */
export const psUpload = handler(parseUploadViewParameters, async (request) => {
  const { user, body } = request;
  // Format Info
  const { uploadedFileName, uploadedFileSize } = body as UploadFileData;
  const { state, year } = request.parameters;

  const username = user.email ?? "";
  const awsFilename = `${KSUID.randomSync().string}_${uploadedFileName}`;
  const fileId = `${year}-${awsFilename}`;

  await createUpload(
    state,
    username,
    uploadedFileName,
    awsFilename,
    fileId,
    uploadedFileSize
  );

  // Pre-sign url
  let psurl = await s3.createPresignedPost({
    Bucket: process.env.attachmentsBucketName,
    Key: awsFilename,
  });
  psurl = fixLocalstackUrl(psurl);
  return ok({ psurl: psurl, fileId: fileId });
});
