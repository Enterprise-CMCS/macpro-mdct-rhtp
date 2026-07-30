import { apiLib } from "utils";
import { getRequestHeaders } from "./getRequestHeaders";
import {
  CreateNotificationRecipientBody,
  NotificationRecipientRecord,
} from "@rhtp/shared";

export async function createNotificationRecipient(
  state: string,
  bodyParams: CreateNotificationRecipientBody
) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...bodyParams },
  };

  return await apiLib.post<NotificationRecipientRecord>(
    `/notifications/recipients/${state}`,
    options
  );
}

export async function getNotificationRecipients() {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.get<NotificationRecipientRecord[]>(
    `/notifications/recipients`,
    options
  );
}

export async function getAssignedStatesByEmail(email: string) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.get<string[]>(
    `/notifications/recipientByEmail/${email}`,
    options
  );
}

export async function deleteNotificationRecipient(state: string, id: string) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.del(`/notifications/recipients/${state}/${id}`, options);
}
