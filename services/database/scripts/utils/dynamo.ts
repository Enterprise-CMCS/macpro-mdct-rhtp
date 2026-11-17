import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  paginateScan,
  Paginator,
  QueryCommandOutput,
  ScanCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { Report, ReportType, StateAbbr } from "@rhtp/shared";

const REPORT_TABLE = `${process.env.STAGE}-reports`;

const config = {
  region: "us-east-1",
  logger: {
    // DynamoDB is quite chatty. We'll ignore most of that for our scripts.
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
};

export const createDynamoClient = () => {
  return DynamoDBDocumentClient.from(new DynamoDBClient(config));
};
const dynamoClient = createDynamoClient();

/** Given a paginator, eagerly collect all of its items in an array */
export const collectPageItems = async <
  T extends QueryCommandOutput | ScanCommandOutput,
>(
  paginator: Paginator<T>
) => {
  let items: Record<string, any>[] = [];
  for await (let page of paginator) {
    items.push(...(page.Items ?? []));
  }
  return items;
};

/** Given a paginator, lazily visit all of its items */
export async function* iteratePageItems<
  T extends QueryCommandOutput | ScanCommandOutput,
>(paginator: Paginator<T>) {
  for await (let page of paginator) {
    yield* page.Items ?? [];
  }
}

/** DynamoDB only allows this many items in a single BatchWriteCommand */
const MAX_BATCH_SIZE = 25;

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
        [REPORT_TABLE]: batch.map((item) => ({
          PutRequest: {
            Item: item,
          },
        })),
      },
    });
    const response = await dynamoClient.send(command);
    if (response.UnprocessedItems?.[REPORT_TABLE]?.length) {
      const unprocessedIds = response.UnprocessedItems[REPORT_TABLE]
        .map((req) => req.PutRequest!.Item!.sortKey)
        .join(", ");
      throw new Error(`Failed to insert item(s): [${unprocessedIds}]`);
    }
  }
};

// Used for zip building - Searches 2 ways. All for one state, or all for one quarter
export const scanAndCompileReports = async (
  reportSubTypes: string[] | undefined,
  state: StateAbbr | undefined
) => {
  const response = paginateScan(
    { client: dynamoClient },
    {
      TableName: REPORT_TABLE,
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
