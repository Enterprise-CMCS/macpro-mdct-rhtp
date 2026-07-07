import { handler } from "../../../libs/handler-lib";
import { forbidden, ok } from "../../../libs/response-lib";
import { emptyParser, parseEmail } from "../../../libs/param-lib";
import { scanAllRecipients } from "../../../storage/notificationRecipients";
import {
  canModifyNotificationRecipients,
  canReadAnyReport,
} from "../../../utils/authorization";
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

export const getAssignedStatesByEmail = handler(parseEmail, async (request) => {
  const { email } = request.parameters;
  const user = request.user;

  // only users who can modify recipients may view all of them
  if (!canReadAnyReport(user)) {
    return forbidden(error.UNAUTHORIZED);
  }
  const recipients = await scanAllRecipients();

  const states = recipients
    .filter((recipient) => recipient.email === email)
    .map((recipient) => recipient.state);

  return ok(states);
});
