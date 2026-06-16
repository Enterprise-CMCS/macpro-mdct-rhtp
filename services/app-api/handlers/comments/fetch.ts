import { handler } from "../../libs/handler-lib";
import { parseCommentPathParams } from "../../libs/param-lib";
import { ok, forbidden } from "../../libs/response-lib";
import { queryComments } from "../../storage/comments";
import {
  canReadInternalComments,
  canReadState,
} from "../../utils/authorization";
import { error } from "../../utils/constants";

export const getComments = handler(parseCommentPathParams, async (request) => {
  const { contextId, state } = request.parameters;
  const { user } = request;

  if (!canReadState(user, state)) {
    return forbidden(error.UNAUTHORIZED);
  }

  const comments = await queryComments(
    contextId,
    canReadInternalComments(user)
  );
  return ok(comments);
});
