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
  state: string,
  bodyParams: createCommentParams
) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
    body: { ...bodyParams },
  };

  return await apiLib.post<Comment>(`/comments/${state}/${contextId}`, options);
}

export async function getComments(contextId: string, state: string) {
  const requestHeaders = await getRequestHeaders();
  const options = {
    headers: { ...requestHeaders },
  };

  return await apiLib.get<Comment[]>(
    `/comments/${state}/${contextId}`,
    options
  );
}
