import { randomUUID } from "node:crypto";
import { handler } from "../../libs/handler-lib";
import { parseCommentPathParams } from "../../libs/param-lib";
import { badRequest, created, forbidden } from "../../libs/response-lib";
import { putComment } from "../../storage/comments";
import {
  canReadInternalComments,
  canWriteComments,
} from "../../utils/authorization";
import { logger } from "../../libs/debug-lib";
import { validateCommentPayload } from "../../utils/reportValidation";
import { error } from "../../utils/constants";

export const createComment = handler(
  parseCommentPathParams,
  async (request) => {
    const { contextId, state } = request.parameters;
    const { user, body } = request;

    if (!canWriteComments(user, state)) {
      return forbidden(error.UNAUTHORIZED);
    }

    const comment = {
      ...body,
      contextId,
      created: Date.now(),
      id: randomUUID(),
      author: user.fullName,
      authorEmail: user.email,
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
  }
);
