/**
 * NOTE: DO NOT COMMIT THE GENERATED FILE WITH ACTUAL STATES DATA TO THE REPO
 *
 * This is a utility for transforming a csv of success and highlight
 * information into a json file. The function expects the csv data
 * in a certain format in order for the transformation to happen properly.
 *
 * in this directory, run `node dataTransform.js`
 */

const { exit } = require("node:process");
const fs = require("node:fs");
const Papa = require("papaparse");

const successAndHighlightsObj = {};

function stripNewlineAndTrim(input) {
  return input.replaceAll("\n", " ").trim();
}

function main() {
  const csvData = fs
    .readFileSync("./success-and-highlights-DONT-COMMIT.csv")
    .toLocaleString();
  const { data: dataSet, errors } = Papa.parse(csvData, { header: true });
  if (errors.length > 0) {
    console.log("ERRORS:", errors);
    exit(1);
  }

  for (const stateData of dataSet) {
    const state = stripNewlineAndTrim(stateData.State);
    const successStory = stripNewlineAndTrim(stateData["Success Stories"]);
    const sustainabilityPlanning = stripNewlineAndTrim(
      stateData["Sustainability Planning"]
    );

    successAndHighlightsObj[state] = {
      successStory,
      sustainabilityPlanning,
    };
  }

  fs.writeFileSync(
    `./success-and-highlights-DONT-COMMIT.json`,
    JSON.stringify(successAndHighlightsObj, null, 2)
  );
}

main();
