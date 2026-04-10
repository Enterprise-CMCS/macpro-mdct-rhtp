import s3 from "../../libs/s3-lib";
import { handler } from "../../libs/handler-lib";
import { parseZipTest } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { queryViewUploads } from "../../storage/upload";

export const getStateZip = handler(parseZipTest, async (request) => {
  const { state, year } = request.parameters;
  const fileId = "initiative-attachments-table";

  const uploads = await queryViewUploads(state, `${fileId}_${year}`);
  const fileNames = uploads.map((upload) => upload.awsFilename);

  const s3Objects = [];
  for (var i = 0; i < fileNames.length; i++) {
    const name = fileNames[i];
    const item = await s3.getObject({
      Bucket: process.env.attachmentsBucketName,
      Key: name,
    });
    s3Objects.push(item);
  }

  const bytes = [];
  for (var j = 0; j < s3Objects.length; j++) {
    const item = await s3Objects[j].Body?.transformToString("base64");
    bytes.push(item);
  }
  return ok({ bytes });
});
