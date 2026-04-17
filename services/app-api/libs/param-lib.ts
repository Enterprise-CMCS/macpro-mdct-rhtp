import { isReportType } from "../types/reports";
import { APIGatewayProxyEvent } from "../types/types";
import { isStateAbbreviation } from "../utils/constants";
import { logger } from "./debug-lib";

export const parseReportTypeAndState = (event: APIGatewayProxyEvent) => {
  const { reportType, state } = event.pathParameters ?? {};

  if (!isReportType(reportType)) {
    logger.warn("Invalid report type in path");
    return undefined;
  }
  if (!isStateAbbreviation(state)) {
    logger.warn("Invalid state abbreviation in path");
    return undefined;
  }

  return { reportType, state };
};

export const parseReportParameters = (event: APIGatewayProxyEvent) => {
  const { reportType, state, id } = event.pathParameters ?? {};

  if (!isReportType(reportType)) {
    logger.warn("Invalid report type in path");
    return undefined;
  }
  if (!isStateAbbreviation(state)) {
    logger.warn("Invalid state abbreviation in path");
    return undefined;
  }
  if (!id) {
    logger.warn("Missing report ID in path");
    return undefined;
  }

  return { reportType, state, id };
};

export const parseInitiativeUpdateParameters = (
  event: APIGatewayProxyEvent
) => {
  const { reportType, state, id, initiativeId } = event.pathParameters ?? {};

  if (!isReportType(reportType)) {
    logger.warn("Invalid report type in path");
    return undefined;
  }
  if (!isStateAbbreviation(state)) {
    logger.warn("Invalid state abbreviation in path");
    return undefined;
  }
  if (!id) {
    logger.warn("Missing report ID in path");
    return undefined;
  }
  if (!initiativeId) {
    logger.warn("Missing initiative ID in path");
    return undefined;
  }

  return { reportType, state, id, initiativeId };
};

export const parseBannerId = (event: APIGatewayProxyEvent) => {
  const { bannerId } = event.pathParameters ?? {};
  if (!bannerId) {
    logger.warn("Invalid banner id in path");
    return undefined;
  }

  return { bannerId };
};

export const parseUploadParameters = (event: APIGatewayProxyEvent) => {
  const { state, reportType, id, fileId } = event.pathParameters ?? {};
  if (!isReportType(reportType)) {
    logger.warn("Invalid report type in path");
    return undefined;
  }
  if (!isStateAbbreviation(state)) {
    logger.warn("Invalid state abbreviation in path");
    return undefined;
  }
  if (!id || !fileId) {
    logger.warn("Missing report ID or file ID in path");
    return undefined;
  }

  return { state, reportType, id, fileId };
};

export const parseCreateUploadParameters = (event: APIGatewayProxyEvent) => {
  const { state, reportType, id } = event.pathParameters ?? {};
  if (!isStateAbbreviation(state)) {
    logger.warn("Invalid state abbreviation in path");
    return undefined;
  }

  if (!state || !reportType || !id) {
    logger.warn("Invalid state, reportType or id in path");
    return undefined;
  }

  return { state, reportType, id };
};

export const parseUploadFiles = (event: APIGatewayProxyEvent) => {
  const { state, reportType, id } = event.pathParameters ?? {};

  if (!isReportType(reportType)) {
    logger.warn("Invalid report type in path");
    return undefined;
  }
  if (!isStateAbbreviation(state)) {
    logger.warn("Invalid state abbreviation in path");
    return undefined;
  }
  if (!id) {
    logger.warn("Missing report ID in path");
    return undefined;
  }

  return { state, reportType, id };
};
