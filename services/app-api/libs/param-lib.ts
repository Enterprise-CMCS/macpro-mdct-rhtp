import { APIGatewayProxyEvent } from "../types/types";
import { logger } from "./debug-lib";

export const parseBannerId = (event: APIGatewayProxyEvent) => {
  const { bannerId } = event.pathParameters ?? {};
  if (!bannerId) {
    logger.warn("Invalid banner id in path");
    return undefined;
  }

  return { bannerId };
};

export const parseUploadParameters = (event: APIGatewayProxyEvent) => {
  const { state, filedId } = event.pathParameters ?? {};
  if (!filedId) {
    logger.warn("Invalid file id in path");
    return undefined;
  }

  return { state, filedId };
};
