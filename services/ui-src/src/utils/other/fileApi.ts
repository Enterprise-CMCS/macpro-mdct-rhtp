import { getRequestHeaders } from "utils/api/requestMethods/getRequestHeaders";
import { apiLib } from "./../api/apiLib";

interface PathURL {
  psurl: string;
}

export const recordFileInDatabaseAndGetUploadUrl = async (
  year: number,
  stateCode: string,
  uploadedFile: File,
) => {
  const requestHeaders = await getRequestHeaders();
  const body = {
    uploadedFileName: uploadedFile.name,
    uploadedFileType: uploadedFile.type,
  };

  const options = {
    headers: { ...requestHeaders },
    body: { ...body },
  };

  const { psurl } = await apiLib.post<PathURL>(
    `/psUrlUpload/${year}/${stateCode}`,
    options,
  );

  return { presignedUploadUrl: psurl };
};

export const uploadFileToS3 = async (
  { presignedUploadUrl }: { presignedUploadUrl: string },
  file: File,
) => {
  return await fetch(presignedUploadUrl, {
    method: "PUT",
    body: file,
  });
};

export const getFileDownloadUrl = async (
  year: string,
  stateCode: string,
  fileId: string,
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { fileId },
  };
  const response = await apiLib.post<PathURL>(
    `/psUrlDownload/${year}/${stateCode}`,
    options,
  );
  return response.psurl;
};

export const getUploadedFiles = async (year: string, stateCode: string) => {
  const body = {
    stateCode,
  };
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...body },
  };
  const response = await apiLib
    .post(`/uploads/${year}/${stateCode}`, options)
    .catch((error) => {
      console.log("!!!Error downloading files: ", error);
    });
  return response ? response : [];
};

export const deleteUploadedFile = async (
  year: string,
  stateCode: string,
  fileId: string,
) => {
  const encodedFileId = encodeURIComponent(fileId);
  await apiLib
    .del(`/uploads/${year}/${stateCode}/${encodedFileId}`, {})
    .catch((error) => {
      console.log("!!!Error retrieving files: ", error);
    });
};
