import { handler } from "../../libs/handler-lib";
import s3 from "../../libs/s3-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { parseUploadViewParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { updateUpload } from "../../storage/upload";
import { UploadFileData } from "../../types/uploads";
/**
 * Updates the Sections associated with a given year and state
 */
export const psUpload = handler(parseUploadViewParameters, async (request) => {
  const { user, body } = request;
  // Format Info
  const { uploadedFileName, uploadId } = body as UploadFileData;
  const { state, year } = request.parameters;

  const username = user.email ?? "";
  const date = new Date();
  const randomValue = Math.floor(Math.random() * (100000 - 100) + 100)
    .toString()
    .padStart(7, "0"); // including a random value allows docs titled the same thing to be uploaded multiple times
  const dateString = `${date.getFullYear()}${date.getMonth()}${date.getDay()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`;
  const awsFilename = `${randomValue}_${dateString}_${uploadedFileName}`;
  const fileId = `${year}-${uploadId}_${awsFilename}`;

  await updateUpload(state, username, uploadedFileName, awsFilename, fileId);

  // Pre-sign url
  let psurl = await s3.createPresignedPost({
    Bucket: process.env.attachmentsBucketName,
    Key: awsFilename,
  });
  psurl = fixLocalstackUrl(psurl);
  return ok({ psurl: psurl });
});
