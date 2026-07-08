import { getRequestHeaders } from "utils/api/requestMethods/getRequestHeaders";
import { apiLib } from "../apiLib";

interface PathURL {
  psurl: string;
  fileId: string;
}

export const recordFileInDatabaseAndGetUploadUrl = async (
  reportType: string,
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
    `/reports/${reportType}/${state}/${id}/files`,
    options
  );

  return { presignedUploadUrl: psurl, fileId };
};

interface ZipStatusResponse {
  status: "ready" | "pending";
  psurl?: string;
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 300; // 15 minutes at 3-second intervals

export const getZipPresignedUrl = async <T>(path: string, body: T) => {
  const requestHeaders = await getRequestHeaders();

  await apiLib.post<{ status: string }>(path, {
    headers: { ...requestHeaders },
    body: body,
  });

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    console.log(`Polling for zip status... (attempt ${i + 1}/${MAX_POLLS})`);

    const freshHeaders = await getRequestHeaders();
    const result = await apiLib.get<ZipStatusResponse>(path, {
      headers: { ...freshHeaders },
    });

    if (result.status === "ready" && result.psurl) {
      return result.psurl;
    }
  }

  throw new Error("Zip generation timed out");
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
  state: string,
  id: string,
  fileId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  const response = await apiLib.get<PathURL>(
    `/reports/${reportType}/${state}/${id}/files/${fileId}`,
    options
  );
  return response.psurl;
};

export const deleteUploadedFile = async (
  reportType: string,
  state: string,
  id: string,
  fileId: string
) => {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };
  await apiLib.del(
    `/reports/${reportType}/${state}/${id}/files/${fileId}`,
    options
  );
};
