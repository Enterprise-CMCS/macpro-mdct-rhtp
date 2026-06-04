import { randomUUID } from "node:crypto";
import { handler } from "../../libs/handler-lib";
import { parseContextId } from "../../libs/param-lib";
import { badRequest, created } from "../../libs/response-lib";
import { putComment } from "../../storage/comments";
import { canReadInternalComments } from "../../utils/authorization";
import { logger } from "../../libs/debug-lib";
import { validateCommentPayload } from "../../utils/reportValidation";

export const createComment = handler(parseContextId, async (request) => {
  const { contextId } = request.parameters;
  const { user, body } = request;

  const comment = {
    ...body,
    contextId,
    created: Date.now(),
    id: randomUUID(),
    author: user.fullName,
    authorEmail: user.email,
    // TODO: This will eventually need to change to allow internal users to select
    // whether a comment is internal or not
    isInternal: canReadInternalComments(user),
  };
  let validatedComment;
  try {
    validatedComment = await validateCommentPayload(comment);
  } catch (error) {
    logger.error(error);
    return badRequest("Invalid request");
  }

  await putComment(validatedComment);

  return created(validatedComment);
});
