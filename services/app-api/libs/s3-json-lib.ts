import s3Lib from "./s3-lib";

// Temporary utility to fetch JSON from S3 for first year reporting
export const getJsonFromS3 = async <T>(key: string): Promise<T | undefined> => {
  try {
    const object = await s3Lib.getObject({
      Bucket: process.env.attachmentsBucketName,
      Key: key,
    });
    const body = await object.Body?.transformToString();
    return body ? JSON.parse(body) : undefined;
  } catch {
    return undefined;
  }
};
