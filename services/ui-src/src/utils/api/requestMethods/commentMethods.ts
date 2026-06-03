import { apiLib } from "utils";
import { getRequestHeaders } from "./getRequestHeaders";
import { Comment } from "@rhtp/shared";

export async function createComment(contextId: string, comment: string) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { comment },
  };

  return await apiLib.post<Comment>(`/comments/${contextId}`, options);
}

export async function getComments(contextId: string) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.get<Comment[]>(`/comments/${contextId}`, options);
}
