import { handler } from "../../libs/handler-lib";
import { putBanner } from "../../storage/banners";
import { error } from "../../utils/constants";
import { badRequest, created, forbidden } from "../../libs/response-lib";
import { canWriteBanner } from "../../utils/authorization";
import { emptyParser } from "../../libs/param-lib";
import { isValidBanner } from "../../utils/bannerValidation";
import { randomUUID } from "node:crypto";

export const createBanner = handler(emptyParser, async (request) => {
  const user = request.user;

  if (!canWriteBanner(user)) {
    return forbidden(error.UNAUTHORIZED);
  }

  if (!isValidBanner(request.body)) {
    return badRequest("Invalid request");
  }

  const currentTime = new Date().toISOString();

  const newBanner = {
    ...request.body,
    key: randomUUID(),
    createdAt: currentTime,
    createdBy: user.fullName,
  };

  await putBanner(newBanner);

  return created(newBanner);
});
