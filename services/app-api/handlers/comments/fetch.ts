import { handler } from "../../libs/handler-lib";
import { parseContextId } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { queryComments } from "../../storage/comments";
import { canReadInternalComments } from "../../utils/authorization";

export const getComments = handler(parseContextId, async (request) => {
  const { contextId } = request.parameters;

  const comments = await queryComments(
    contextId,
    canReadInternalComments(request.user)
  );
  return ok(comments);
});
