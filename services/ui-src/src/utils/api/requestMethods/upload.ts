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
  uploadedFile: File,
  uploadId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const body = {
    uploadedFileName: uploadedFile.name,
    uploadedFileType: uploadedFile.type,
    uploadedFileSize: uploadedFile.size,
    uploadId,
  };

  const options = {
    headers: { ...requestHeaders },
    body: { ...body },
  };

  const { psurl, fileId } = await apiLib.post<PathURL>(
    `/uploads/${year}/${stateCode}`,
    options
  );

  return { presignedUploadUrl: psurl, fileId };
};

export const getZip = async (
  year: string,
  stateCode: string,
  fileId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };
  const response = await apiLib.get<any>(
    `/uploads/${year}/${stateCode}/${fileId}/zip`,
    options
  );
  return response ?? [];
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
  };

  const response = await apiLib.get<PathURL>(
    `/uploads/${year}/${stateCode}/${fileId}`,
    options
  );
  return response.psurl;
};

export const getUploadedFiles = async (
  year: string,
  stateCode: string,
  uploadId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  const response = await apiLib.get<UploadData[]>(
    `/uploads/${year}/${stateCode}/view/${uploadId}`,
    options
  );
  return response ?? [];
};

export const deleteUploadedFile = async (
  year: string,
  stateCode: string,
  fileId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };
  await apiLib.del(`/uploads/${year}/${stateCode}/${fileId}`, options);
};
