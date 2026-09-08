import { handler } from "../../libs/handler-lib";
import { ok } from "../../libs/response-lib";
import { emptyParser } from "../../libs/param-lib";
import { scanAllDataSets } from "../../storage/dataset";

export const getDataSets = handler(emptyParser, async (_request) => {
  const dataSets = await scanAllDataSets();
  return ok(dataSets);
});
