/**
 * NOTE: DO NOT COMMIT THE GENERATED FILE WITH ACTUAL STATES DATA TO THE REPO (empty-commitments.json is ok)
 *
 * This is a utility for transforming a csv of state policy commitment
 * information into a json file. The function expects the csv data
 * in a certain format in order for the transformation to happen properly.
 *
 * in this directory, run `node dataTransform.js`
 */

const { STATE_POLICY_COMMITMENT_NAMES } = require("../constants.ts");
const { exit } = require("node:process");
const fs = require("node:fs");
const Papa = require("papaparse");

const commitmentMap = new Map();

function stripNewlineAndTrim(input) {
  return input.replaceAll("\n", " ").trim();
}

function main() {
  const csvData = fs
    .readFileSync("./commitments-DONT-COMMIT.csv")
    .toLocaleString();
  const { data: dataSet, errors } = Papa.parse(csvData, { header: true });
  if (errors.length > 0) {
    console.log("ERRORS:", errors);
    exit(1);
  }

  for (const [rowIndex, stateData] of dataSet.entries()) {
    const state = stripNewlineAndTrim(stateData.State);
    const criterion = stripNewlineAndTrim(
      stateData["Workload Funding Score Factor Criterion"]
    );
    const scoreFactor = stripNewlineAndTrim(stateData["Score Factor"]);

    const label = `${scoreFactor} ${criterion}`.trim();
    if (!STATE_POLICY_COMMITMENT_NAMES.includes(label)) {
      throw new Error(
        `Unexpected commitment name found in row ${rowIndex + 1}: ${label}. Please correct and rerun`
      );
    }

    const links = stripNewlineAndTrim(stateData["Supporting Evidence"])
      .split(",")
      .map((link) => link.trim())
      .filter((link) => link.length > 0);

    const commitment = {
      label,
      status: stripNewlineAndTrim(stateData["Current Status"]),
      links,
    };
    const commitmentsByState = commitmentMap.get(state) || [];
    commitmentMap.set(state, [...commitmentsByState, commitment]);
  }

  const commitmentObj = {};
  for (const [state, commitments] of commitmentMap.entries()) {
    commitmentObj[state] = commitments;
  }

  fs.writeFileSync(
    `./commitments-DONT-COMMIT.json`,
    JSON.stringify(commitmentObj, null, 2)
  );
}

main();
