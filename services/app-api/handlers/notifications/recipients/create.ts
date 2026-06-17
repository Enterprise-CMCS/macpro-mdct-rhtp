import { handler } from "../../../libs/handler-lib";
import { forbidden, ok } from "../../../libs/response-lib";
import { parseState } from "../../../libs/param-lib";
import { putRecipient } from "../../../storage/notificationRecipients";
import { randomUUID } from "node:crypto";
import { canModifyNotificationRecipients } from "../../../utils/authorization";
import { error } from "../../../utils/constants";
import { CreateNotificationRecipientBody } from "@rhtp/shared";

export const createNotificationRecipient = handler(
  parseState,
  async (request) => {
    const { user, body } = request;
    const { state } = request.parameters;
    const { email } = body as CreateNotificationRecipientBody;
    const { fullName } = user;

    if (!canModifyNotificationRecipients(user)) {
      return forbidden(error.UNAUTHORIZED);
    }

    const recipientBody = {
      email,
      state,
      id: randomUUID(),
      addedBy: fullName,
      created: Date.now(),
    };

    await putRecipient(recipientBody);
    return ok(recipientBody);
  }
);
