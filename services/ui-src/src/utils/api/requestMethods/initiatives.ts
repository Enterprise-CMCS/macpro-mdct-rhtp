import { apiLib } from "utils";
import { getRequestHeaders } from "./getRequestHeaders";
import { Report } from "types";

interface CreateInitiativeData {
  initiativeName: string;
  initiativeNumber: string;
}

interface UpdateInitiativeData {
  initiativeAbandon: boolean;
}

async function createInitiative(report: Report, data: CreateInitiativeData) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...data },
  };

  return await apiLib.post(
    `/reports/${report.type}/${report.state}/${report.id}/initiatives`,
    options
  );
}

async function updateInitiative(
  report: Report,
  data: UpdateInitiativeData,
  initiativeId: string
) {
  const requestHeaders = await getRequestHeaders();
  const request = {
    headers: { ...requestHeaders },
    body: { ...data },
  };

  return await apiLib.put(
    `/reports/${report.type}/${report.state}/${report.id}/initiatives/${initiativeId}`,
    request
  );
}

export { createInitiative, updateInitiative };
