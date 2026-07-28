import { ReportType } from "@rhtp/shared";
import { getReport } from "../../../storage/reports";

/**
 * Filters for only the metadata, that way we trigger kafka streams 1x per report update.
 * Assembles the entire report based on the keys to send across Kafka
 *
 * @param keys
 * @param record
 */
export const transformReport = async (
  keys: Record<string, any>,
  _record: Record<string, any>
) => {
  const state = keys["pKey"].split("#")[0];
  const sortKeySegments = keys["sortKey"].split("#");

  // If we have ID segments after the #, we are looking at a page object, not a metadata entry
  if (sortKeySegments.length > 1) return;

  const id = sortKeySegments[0];
  return await getReport(ReportType.RHTP, state, id);
};
