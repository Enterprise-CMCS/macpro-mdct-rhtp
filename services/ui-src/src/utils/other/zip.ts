import { getZipPresignedUrl } from "utils/api/requestMethods/upload";
import { Report } from "@rhtp/shared";

export const createZipFile = async (report: Report) => {
  const { state, id, type } = report;

  const response = await getZipPresignedUrl(type, state, id);

  console.log("Presigned URL for ZIP file:", response);

  // const link = document.createElement("a");
  // link.href = psurl;
  // link.click();
};
