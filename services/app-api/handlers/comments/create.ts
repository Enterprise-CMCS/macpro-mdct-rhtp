import { randomUUID } from "node:crypto";
import { handler } from "../../libs/handler-lib";
import { parseContextId } from "../../libs/param-lib";
import { badRequest, created } from "../../libs/response-lib";
import { putComment } from "../../storage/comments";

export const createComment = handler(parseContextId, async (request) => {
  const { contextId } = request.parameters;
  const body = request.body as { comment?: string } | undefined;

  if (!body?.comment) {
    return badRequest("Missing required field: comment");
  }

  const comment = {
    contextId,
    created: Date.now(),
    id: randomUUID(),
    author: request.user.fullName,
    authorEmail: request.user.email,
    comment: body.comment,
    isInternal: false,
  };

  await putComment(comment);

  return created(comment);
});
