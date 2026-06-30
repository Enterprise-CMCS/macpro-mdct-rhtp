import { handler } from "../../../libs/handler-lib";
import { ok } from "../../../libs/response-lib";
import { emptyParser } from "../../../libs/param-lib";
import { scanAllRecipients } from "../../../storage/notificationRecipients";

export const getNotificationRecipients = handler(emptyParser, async () => {
  const recipients = await scanAllRecipients();

  return ok(recipients);
});
