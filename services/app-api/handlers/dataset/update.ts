import { handler } from "../../libs/handler-lib";
import { putDataSet } from "../../storage/dataset";
import { error } from "../../utils/constants";
import { badRequest, forbidden, ok } from "../../libs/response-lib";
import { canWriteBanner } from "../../utils/authorization";
import { parseDataSetId } from "../../dataSets/libs/param-lib";
import { isValidDataSet } from "../../utils/dataSetValidation";

export const updateDataSet = handler(parseDataSetId, async (request) => {
  const user = request.user;

  if (!canWriteBanner(user)) {
    return forbidden(error.UNAUTHORIZED);
  }

  if (!isValidDataSet(request.body)) {
    return badRequest("Invalid request");
  }

  await putDataSet(request.body);
  return ok(request.body);
});
