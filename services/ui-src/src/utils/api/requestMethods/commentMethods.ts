import { apiLib } from "utils";
import { getRequestHeaders } from "./getRequestHeaders";
import { Comment, CommentType } from "@rhtp/shared";

interface createCommentParams {
  type: CommentType;
  parentReportId?: string;
  comment?: string;
  statusChange?: string;
}

export async function createComment(
  contextId: string,
  bodyParams: createCommentParams
) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...bodyParams },
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
