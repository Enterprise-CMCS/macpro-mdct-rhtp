import { getRequestHeaders } from "utils/api/requestMethods/getRequestHeaders";
import { apiLib } from "../apiLib";

interface PathURL {
  psurl: string;
  fileId: string;
}

export interface UploadData {
  uploadedState: string;
  awsFilename: string;
  filename: string;
  uploadedDate: string;
  uploadedUsername: string;
  fileId: string;
  filesize: number;
}

export const recordFileInDatabaseAndGetUploadUrl = async (
  year: string,
  stateCode: string,
  uploadedFile: File
) => {
  const requestHeaders = await getRequestHeaders();
  const body = {
    uploadedFileName: uploadedFile.name,
    uploadedFileType: uploadedFile.type,
    uploadedFileSize: uploadedFile.size,
  };

  const options = {
    headers: { ...requestHeaders },
    body: { ...body },
  };

  const { psurl } = await apiLib.post<PathURL>(
    `/uploads/upload/${year}/${stateCode}`,
    options
  );

  return { presignedUploadUrl: psurl };
};

export const uploadFileToS3 = async (
  { presignedUploadUrl }: { presignedUploadUrl: string },
  file: File
) => {
  return await fetch(presignedUploadUrl, {
    method: "PUT",
    body: file,
  });
};

export const getFileDownloadUrl = async (
  year: string,
  stateCode: string,
  fileId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: {},
  };
  const response = await apiLib.get<PathURL>(
    `/uploads/download/${year}/${stateCode}/${fileId}`,
    options
  );
  return response.psurl;
};

export const getUploadedFiles = async (year: string, stateCode: string) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: {},
  };
  const response = await apiLib.get<UploadData[]>(
    `/uploads/${year}/${stateCode}`,
    options
  );
  return response ? response : [];
};

export const deleteUploadedFile = async (
  year: string,
  stateCode: string,
  fileId: string
) => {
  const encodedFileId = encodeURIComponent(fileId);
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: {},
  };
  await apiLib.del(`/uploads/${year}/${stateCode}/${encodedFileId}`, options);
};
