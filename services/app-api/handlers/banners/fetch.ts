import { handler } from "../../libs/handler-lib";
import { scanAllBanners } from "../../storage/banners";
import { ok } from "../../libs/response-lib";
import { emptyParser } from "../../libs/param-lib";

export const getBanners = handler(emptyParser, async (_request) => {
  const banners = await scanAllBanners();
  return ok(banners);
});
