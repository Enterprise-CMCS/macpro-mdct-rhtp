import { handler } from "../../libs/handler-lib";
import { putBanner } from "../../storage/banners";
import { error } from "../../utils/constants";
import { badRequest, forbidden, ok } from "../../libs/response-lib";
import { canWriteBanner } from "../../utils/authorization";
import { parseBannerId } from "../../libs/param-lib";
import { isValidBanner } from "../../utils/bannerValidation";

export const updateBanner = handler(parseBannerId, async (request) => {
  const user = request.user;

  if (!canWriteBanner(user)) {
    return forbidden(error.UNAUTHORIZED);
  }

  if (!isValidBanner(request.body)) {
    return badRequest("Invalid request");
  }

  await putBanner(request.body);
  return ok(request.body);
});
