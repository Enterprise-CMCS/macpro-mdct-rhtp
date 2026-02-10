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
