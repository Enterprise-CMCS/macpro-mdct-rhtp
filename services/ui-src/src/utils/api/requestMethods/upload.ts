import { getRequestHeaders } from "utils/api/requestMethods/getRequestHeaders";
import { apiLib } from "../apiLib";

interface PathURL {
  psurl: string;
  fileId: string;
}

interface ZipData {
  name: string;
  bytes: string;
}

export const recordFileInDatabaseAndGetUploadUrl = async (
  id: string,
  reportType: string,
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

  const { psurl, fileId } = await apiLib.post<PathURL>(
    `/reports/${reportType}/${stateCode}/${id}/files`,
    options
  );

  return { presignedUploadUrl: psurl, fileId };
};

export const getFileBytes = async (
  reportType: string,
  stateCode: string,
  id: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };
  const response = await apiLib.get<ZipData[]>(
    `/reports/${reportType}/${stateCode}/${id}/files/`,
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
  reportType: string,
  stateCode: string,
  id: string,
  fileId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  const response = await apiLib.get<PathURL>(
    `/reports/${reportType}/${stateCode}/${id}/files/${fileId}`,
    options
  );
  return response.psurl;
};

export const deleteUploadedFile = async (
  reportType: string,
  stateCode: string,
  id: string,
  fileId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };
  await apiLib.del(
    `/reports/${reportType}/${stateCode}/${id}/files/${fileId}`,
    options
  );
};
