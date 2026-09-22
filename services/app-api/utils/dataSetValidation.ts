import { logger } from "../libs/debug-lib";
import { DataSetType } from "../storage/dataset";

export const isValidDataSet = (dataset: unknown): dataset is DataSetType => {
  if (!dataset || "object" !== typeof dataset) {
    logger.warn("Invalid: dataset must be an object");
    return false;
  }

  const requiredFields = ["key", "name", "status", "createdAt", "createdBy"];

  const allowedFields = [...requiredFields];
  if (Object.keys(dataset).some((key) => !allowedFields.includes(key))) {
    logger.warn("Invalid: dataset contains unwanted fields");
    return false;
  }

  if (!("name" in dataset) || "string" !== typeof dataset.name) {
    logger.warn("Invalid: dataset.name must be a string");
    return false;
  }

  if (!("status" in dataset) || "string" !== typeof dataset.status) {
    logger.warn("Invalid: dataset.status must be a string");
    return false;
  }

  return true;
};
