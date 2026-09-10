/**
 * NOTE: DO NOT COMMIT THE GENERATED FILE WITH ACTUAL STATES DATA TO THE REPO
 *
 * This is a utility for transforming a csv of general information into a json file. The function expects the csv data
 * in a certain format in order for the transformation to happen properly.
 *
 * in this directory, run `node dataTransform.js`
 */

const { exit } = require("node:process");
const fs = require("node:fs");
const Papa = require("papaparse");

const generalInformationObj = {};

function stripNewlineAndTrim(input) {
  return input.replaceAll("\n", " ").trim();
}

function main() {
  const csvData = fs
    .readFileSync("./general-information-DONT-COMMIT.csv")
    .toLocaleString();
  const { data: dataSet, errors } = Papa.parse(csvData, { header: true });
  if (errors.length > 0) {
    console.log("ERRORS:", errors);
    exit(1);
  }

  for (const stateData of dataSet) {
    const state = stripNewlineAndTrim(stateData.State);
    const AOR = stripNewlineAndTrim(
      stateData["Authorized Organizational Representative (AOR)"]
    );
    const AORemail = stripNewlineAndTrim(
      stateData["Authorized Organizational Representative (AOR) Contact email"]
    );
    const PIPD = stripNewlineAndTrim(
      stateData["Principal Investigator or Program Director"]
    );
    const PIPDemail = stripNewlineAndTrim(
      stateData["Principal Investigator or Program Director Contact email"]
    );

    generalInformationObj[state] = {
      AOR,
      AORemail,
      PIPD,
      PIPDemail,
    };
  }

  fs.writeFileSync(
    `./general-information-DONT-COMMIT.json`,
    JSON.stringify(generalInformationObj, null, 2)
  );
}

main();
