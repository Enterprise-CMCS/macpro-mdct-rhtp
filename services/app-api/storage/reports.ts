/*
 * Reports are stored with a heterogenous, single-table schema.
 *
 * Single table: All report types (only RHTP at current time) are stored in the same table.
 * The partition key (`pKey`) includes both the report type and the state.
 * This gives us performance roughly equivalent to table-per-type,
 * without the operational complexity of creating and managing many tables.
 * We never query for multiple states at once, or multiple types at once.
 *
 * Heterogenous: This table contains Report items and Page items.
 * The rest of the app treats a 5-page report as one object,
 * but we store it as six separate objects: the report plus its five pages.
 * A report's `sortKey` is just its ID, but a page's `sortKey`
 * contains its report's ID as well as its own (page) ID.
 * Breaking things up this way keeps us under the DynamoDB item size limit,
 * while still allowing for very fast queries.
 *
 * The `pKey` and `sortKey` properties are created on-the-fly when we send
 * the report to DynamoDB, and stripped out when we query the report back;
 * the rest of the application has no idea these two properties exist.
 * For an example of how the report pages are disassembled and reassembled,
 * see this code's unit tests.
 */
import {
  paginateQuery,
  QueryCommandInput,
  QueryCommand,
  BatchWriteCommand,
  paginateScan,
} from "@aws-sdk/lib-dynamodb";
import {
  collectPageItems,
  createClient as createDynamoClient,
} from "./dynamo/dynamodb-lib";
import { reportTable } from "../utils/constants";
import { StateAbbr, Report, ReportType, LiteReport } from "@rhtp/shared";

/** DynamoDB only allows this many items in a single BatchWriteCommand */
const MAX_BATCH_SIZE = 25;

const dynamoClient = createDynamoClient();

export const putReport = async (report: Report) => {
  const items = [
    {
      ...report,
      pKey: `${report.type}#${report.state}`,
      sortKey: report.id,
      pages: report.pages.map((page) => `${report.id}#${page.id}`),
    },
    ...report.pages.map((page) => ({
      ...page,
      pKey: `${report.type}#${report.state}`,
      sortKey: `${report.id}#${page.id}`,
    })),
  ];

  for (let i = 0; i < items.length; i += MAX_BATCH_SIZE) {
    const batch = items.slice(i, i + MAX_BATCH_SIZE);
    const command = new BatchWriteCommand({
      RequestItems: {
        [reportTable]: batch.map((item) => ({
          PutRequest: {
            Item: item,
          },
        })),
      },
    });
    const response = await dynamoClient.send(command);
    if (response.UnprocessedItems?.[reportTable]?.length) {
      const unprocessedIds = response.UnprocessedItems[reportTable]
        .map((req) => req.PutRequest!.Item!.sortKey)
        .join(", ");
      throw new Error(`Failed to insert item(s): [${unprocessedIds}]`);
    }
  }
};

export const getReport = async (
  reportType: ReportType,
  state: StateAbbr,
  id: string
) => {
  const response = await dynamoClient.send(
    new QueryCommand({
      TableName: reportTable,
      KeyConditionExpression: "pKey = :pKey AND begins_with(sortKey, :id)",
      ExpressionAttributeValues: {
        ":pKey": `${reportType}#${state}`,
        ":id": id,
      },
    })
  );
  const items = response.Items ?? [];
  return mergeReportPages(items);
};

export const queryReportsForState = async (
  reportType: ReportType,
  state: StateAbbr
) => {
  const params: QueryCommandInput = {
    TableName: reportTable,
    KeyConditionExpression: "pKey = :pKey",
    ExpressionAttributeValues: { ":pKey": `${reportType}#${state}` },
  };
  const response = paginateQuery({ client: dynamoClient }, params);
  const items = await collectPageItems(response);
  return (items as ReportTableItem[]).filter(isStoredReport).map(toLiteReport);
};

export const scanLiteReports = async () => {
  const response = paginateScan(
    { client: dynamoClient },
    {
      TableName: reportTable,
    }
  );
  const items = await collectPageItems(response);
  return (items as ReportTableItem[]).filter(isStoredReport).map(toLiteReport);
};

// Used for zip building - Searches 2 ways. All for one state, or all for one quarter
export const scanAndCompileReports = async (
  reportSubTypes: string[] | undefined,
  state: StateAbbr | undefined
) => {
  const response = paginateScan(
    { client: dynamoClient },
    {
      TableName: reportTable,
    }
  );

  const items = (await collectPageItems(response)) as ReportTableItem[];

  // Group items into subarrays by report, then build normally
  const getId = (item: ReportTableItem) => item["sortKey"].split("#")[0];
  const groupedItems = Object_groupBy(items, getId);

  const groupedReports = (Object.values(groupedItems) as ReportTableItem[][])
    .map(mergeReportPages)
    .filter((report) => !!report);
  const filteredReports = groupedReports.filter(
    (report) =>
      (!state || report.state == state) &&
      (!reportSubTypes ||
        reportSubTypes.length === 0 ||
        reportSubTypes.includes(report.subTypeKey))
  );

  return filteredReports;
};

/** Is this item a StoredReport or StoredPage? */
function isStoredReport(item: ReportTableItem): item is StoredReport {
  return item.id === item.sortKey;
}

/** Strip out storage fields and the array of page sortKeys. */
function toLiteReport(report: Partial<StoredReport>): LiteReport {
  delete report.pKey;
  delete report.sortKey;
  delete report.pages;
  return report as LiteReport;
}

/** Takes an array of results assuming ONE is a liteReport and it can merge with the others **/
function mergeReportPages(items: Record<string, any>[]): Report | undefined {
  const liteReport = items.find((item) => item.sortKey === item.id);
  if (!liteReport) return undefined;

  liteReport.pages = liteReport.pages.map((pageSortKey: string) =>
    items.find((i) => i.sortKey === pageSortKey)
  );
  if (liteReport.pages.some((page: object) => !page)) {
    throw new Error(`Could not find all pages for report ${liteReport.id}`);
  }
  delete liteReport.pKey;
  delete liteReport.sortKey;
  for (let page of liteReport.pages) {
    delete page.pKey;
    delete page.sortKey;
  }
  return liteReport as Report;
}

export const deleteReport = async (
  reportType: ReportType,
  state: StateAbbr,
  id: string
) => {
  const response = await dynamoClient.send(
    new QueryCommand({
      TableName: reportTable,
      KeyConditionExpression: "pKey = :pKey AND begins_with(sortKey, :id)",
      ExpressionAttributeValues: {
        ":pKey": `${reportType}#${state}`,
        ":id": id,
      },
    })
  );
  const items = response.Items as ReportTableItem[];
  if (!items) throw new Error("Requested report not found");

  for (let i = 0; i < items.length; i += MAX_BATCH_SIZE) {
    const batch = items.slice(i, i + MAX_BATCH_SIZE);
    const command = new BatchWriteCommand({
      RequestItems: {
        [reportTable]: batch.map((item) => ({
          DeleteRequest: {
            Key: { pKey: item.pKey, sortKey: item.sortKey },
          },
        })),
      },
    });
    const response = await dynamoClient.send(command);
    if (response.UnprocessedItems?.[reportTable]?.length) {
      const unprocessedIds = response.UnprocessedItems[reportTable]
        .map((req) => req.PutRequest!.Item!.sortKey)
        .join(", ");
      throw new Error(`Failed to delete item(s): [${unprocessedIds}]`);
    }
  }
};

type ReportTableItem = StoredReport | StoredPage;

type ReportPage = Report["pages"][number];

type StoredReport = Omit<Report, "pages"> & {
  pKey: `${ReportType}#${StateAbbr}`;
  sortKey: Report["id"];
  pages: StoredPage["sortKey"][];
};

type StoredPage = ReportPage & {
  pKey: StoredReport["pKey"];
  sortKey: `${Report["id"]}#${ReportPage["id"]}`;
};

/**
 * Ponyfill for `Object.groupBy`, which _should_ be safe in Node 21+.
 *
 * But TS is complaining. Replace me when we're targeting ES2024, please.
 */
function Object_groupBy<TKey extends string | number | symbol, TItem>(
  items: Iterable<TItem>,
  selector: (item: TItem) => TKey
) {
  const groups: Partial<Record<TKey, TItem[]>> = {};
  for (let item of items) {
    const key = selector(item);
    if (key in groups) {
      groups[key]!.push(item);
    } else {
      groups[key] = [item];
    }
  }
  return groups;
}
