import { apiLib } from "utils";
import {
  CreateInitiativeOptions,
  Report,
  UpdateInitiativeOptions,
} from "@rhtp/shared";
import { getRequestHeaders } from "./getRequestHeaders";

async function createInitiative(report: Report, data: CreateInitiativeOptions) {
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
  data: UpdateInitiativeOptions,
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
