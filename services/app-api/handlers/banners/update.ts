import { handler } from "../../libs/handler-lib";
import { putBanner } from "../../storage/banners";
import { error } from "../../utils/constants";
import { badRequest, forbidden, ok } from "../../libs/response-lib";
import { canWriteBanner } from "../../utils/authorization";
import { parseBannerId } from "../../libs/param-lib";
import { isValidBanner } from "../../utils/bannerValidation";

export const updateBanner = handler(parseBannerId, async (request) => {
  const user = request.user;
  const { bannerId } = request.parameters;

  if (!canWriteBanner(user)) {
    return forbidden(error.UNAUTHORIZED);
  }

  if (!isValidBanner(request.body)) {
    return badRequest("Invalid request");
  }

  const currentTime = new Date().toISOString();

  const newBanner = {
    ...request.body,
    key: bannerId,
    createdAt: currentTime,
    createdBy: user.fullName,
  };

  await putBanner(newBanner);
  return ok();
});
