import { handler } from "../../../libs/handler-lib";
import { forbidden, ok } from "../../../libs/response-lib";
import { emptyParser } from "../../../libs/param-lib";
import { scanAllRecipients } from "../../../storage/notificationRecipients";
import { canModifyNotificationRecipients } from "../../../utils/authorization";
import { error } from "../../../utils/constants";

export const getNotificationRecipients = handler(
  emptyParser,
  async (request) => {
    const user = request.user;

    // only users who can modify recipients may view all of them
    if (!canModifyNotificationRecipients(user)) {
      return forbidden(error.UNAUTHORIZED);
    }
    const recipients = await scanAllRecipients();

    return ok(recipients);
  }
);
