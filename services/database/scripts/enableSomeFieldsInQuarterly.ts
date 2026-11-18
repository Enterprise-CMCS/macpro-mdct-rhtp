/*
 * Export AWS Credentials first, then add STAGE.
 *
 * export STAGE="val"
 * npx tsx scripts/enableSomeFieldsInQuarterly.ts
 */
import { PageElement } from "@rhtp/shared";
import { putReport, scanAndCompileReports } from "./utils/dynamo.ts";

const logPrefix = () => new Date().toISOString() + " | ";

async function main() {
  console.info("Beginning Scan of DB Records");
  const reports = await scanAndCompileReports(["Q1"], undefined); // get Q1 reports for all states
  for (const record of reports) {
    for (const page of record.pages) {
      if (page.id === "sustainability-and-highlights") {
        page.elements &&
          enableElementById(page.elements, "sustainability-planning");
      } else if ("initiativeNumber" in page) {
        enableElementById(page.elements, "initiative-number-of-people-served");
      }
    }
    await putReport(record);
  }

  console.info(`${logPrefix()} Dynamo Records Updated: ${reports.length}`);
}

const enableElementById = (elements: PageElement[], id: string) => {
  for (const element of elements) {
    if (element.id === id && "quarterly" in element) {
      element.quarterly = true;
      element.disabled = false;
      element.required = false; // this should already be false
    }
  }
};

main();
