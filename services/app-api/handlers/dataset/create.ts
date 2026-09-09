import { handler } from "../../libs/handler-lib";
import { randomUUID } from "node:crypto";
import { emptyParser } from "../../dataSets/libs/param-lib";
import { canWriteBanner } from "../../utils/authorization";
import { created, forbidden } from "../../libs/response-lib";
import { error } from "../../utils/constants";
import { putDataSet } from "../../storage/dataset";

export const createDataSet = handler(emptyParser, async (request) => {
  const { user, body } = request;
  const { name, status } = body as { name: string; status: string };

  if (!canWriteBanner(user)) {
    return forbidden(error.UNAUTHORIZED);
  }

  //TODO: Revisit whether to use this or not
  // if (!isValidDataSet(request.body)) {
  //   return badRequest("Invalid request");
  // }

  const currentTime = new Date().toISOString();

  const newDataSet = {
    key: randomUUID(),
    name,
    status,
    createdAt: currentTime,
    createdBy: user.fullName,
  };

  await putDataSet(newDataSet);

  return created(newDataSet);
});
