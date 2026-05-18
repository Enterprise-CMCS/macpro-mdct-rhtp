import { Report } from "@rhtp/shared";
import { apiLib } from "../apiLib";
import { getRequestHeaders } from "./getRequestHeaders";

async function sendEmail(report: Report) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { message: "Please send" },
  };

  return await apiLib.post(
    `/reports/${report.type}/${report.state}/${report.id}/notifications`,
    options
  );
}

export { sendEmail };
