import { isStateAbbr } from "@rhtp/shared";
import { APIGatewayProxyEvent } from "../../types/types";
import { logger } from "./debug-lib";

export const emptyParser = (_event: APIGatewayProxyEvent) => ({});

export const parseDataSetId = (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters ?? {};
  if (!id) {
    logger.warn("Invalid banner id in path");
    return undefined;
  }

  return { id };
};

export const parseDataSetFileUploadDownloadParameters = (
  event: APIGatewayProxyEvent
) => {
  const { state, id, fileId } = event.pathParameters ?? {};

  if (!isStateAbbr(state)) {
    logger.warn("Invalid state abbreviation in path");
    return undefined;
  }

  if (!id || !fileId) {
    logger.warn("Missing file ID in path");
    return undefined;
  }

  return { state, id, fileId };
};

export const parseDataSetFileCreateParameters = (
  event: APIGatewayProxyEvent
) => {
  const { state, id } = event.pathParameters ?? {};

  if (!isStateAbbr(state)) {
    logger.warn("Invalid state abbreviation in path");
    return undefined;
  }

  if (!id) {
    logger.warn("Missing file ID in path");
    return undefined;
  }

  return { state, id };
};

export const parseDataSetFileUploadParameters = (
  event: APIGatewayProxyEvent
) => {
  const { state } = event.pathParameters ?? {};

  if (!isStateAbbr(state)) {
    logger.warn("Invalid state abbreviation in path");
    return undefined;
  }

  return { state };
};
