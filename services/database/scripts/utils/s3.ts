import { S3Client } from "@aws-sdk/client-s3";

const config = {
  region: "us-east-1",
  logger: {
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
};

export const createS3Client = () => {
  return new S3Client(config);
};
