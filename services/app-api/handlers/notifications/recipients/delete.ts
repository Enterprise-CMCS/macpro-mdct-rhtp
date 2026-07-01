import { handler } from "../../../libs/handler-lib";
import { error } from "../../../utils/constants";
import { forbidden, ok } from "../../../libs/response-lib";
import { canModifyNotificationRecipients } from "../../../utils/authorization";
import { parseStateAndId } from "../../../libs/param-lib";
import { deleteRecipient } from "../../../storage/notificationRecipients";

export const deleteNotificationRecipient = handler(
  parseStateAndId,
  async (request) => {
    const { state, id } = request.parameters;
    const user = request.user;

    if (!canModifyNotificationRecipients(user)) {
      return forbidden(error.UNAUTHORIZED);
    }
    await deleteRecipient(state, id);
    return ok();
  }
);
