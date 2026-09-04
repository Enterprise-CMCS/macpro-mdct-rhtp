import { getRequestHeaders } from "utils/api/requestMethods/getRequestHeaders";
import { apiLib } from "../apiLib";
import { DataSetType } from "dataSet/component/forms/Dashboard";

interface PathURL {
  psurl: string;
  fileId: string;
}

export async function getFilesByState(state: string) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.get<DataSetType[]>(`/dataset/${state}`, options)!;
}

export const recordFileInDatabaseAndGetUploadUrl = async (
  state: string,
  id: string,
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
    `/dataset/${state}/${id}`,
    options
  );

  return { presignedUploadUrl: psurl, fileId };
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
  datasetId: string,
  state: string,
  fileId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  const response = await apiLib.get<PathURL>(
    `/dataset/${state}/${datasetId}/files/${fileId}`,
    options
  );
  return response.psurl;
};

export const deleteUploadedFile = async (
  state: string,
  id: string,
  fileId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };
  await apiLib.del(`/dataset/${state}/${id}/files/${fileId}`, options);
};
