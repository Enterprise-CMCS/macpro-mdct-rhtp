/**
 * This is a utility for transforming a csv of initiative information
 * into a json file. The function expects the csv data in a certain
 * format in order for the transformation to happen properly.
 *
 * in this directory, run `node dataTransform.js`
 * 
 * Headings (csv: json)
 *  State: state
 *  Initiative name: title
 *  Initiative Number: initiativeNumber
 *  Initiative status: status
 *  Initiative Narrative: narrative
 *  Initiative Metrics (Semicolon Separated): metrics
 *  Metric Statuses (Semicolon-Separated): metricStatuses
 * 
 * papaparse returns data in a data array with objects of header keys and cell values
  {
    "State": "AL",
    "Initiative name": "Sample name",
    "Initiative Number": "1",
    "Initiative status": "In progress",
    "Initiative Narrative": "Sample narrative",
    "Initiative Metrics (Semicolon Separated)": "Sample metric 1;Sample Metric 2",
    "Metric Statuses (Semicolon-Separated)": "Active;Active"
  },
 */

const { exit } = require("node:process");
const fs = require("node:fs");
const Papa = require("papaparse");

const initiativesMap = new Map();

function stripNewlineAndTrim(input) {
  return input.replaceAll("\n", " ").trim();
}

function main() {
  const csvData = fs.readFileSync("./initiatives.csv").toLocaleString();
  const { data: dataSet, errors } = Papa.parse(csvData, { header: true });
  if (errors.length > 0) {
    console.log("ERRORS:", result.errors);
    exit(1);
  }

  for (const initiativeData of dataSet) {
    const state = stripNewlineAndTrim(initiativeData.State);
    const metricList = stripNewlineAndTrim(
      initiativeData["Initiative Metrics (Semicolon Separated)"]
    ).split(";");
    const metricStatuses =
      initiativeData["Metric Statuses (Semicolon-Separated)"].split(";");
    const metricTargets =
      initiativeData["Metric Targets (Semicolon-Separated)"].split(";"); // TODO: update naming as needed once we have CMS data
    const initiative = {
      id: crypto.randomUUID(),
      title: stripNewlineAndTrim(initiativeData["Initiative name"]),
      initiativeNumber: stripNewlineAndTrim(
        initiativeData["Initiative Number"]
      ),
      narrative: initiativeData["Initiative Narrative"],
      status: stripNewlineAndTrim(initiativeData["Initiative status"]),
    };

    const metrics = [];
    metricList.forEach((metricName, index) => {
      const metric = {
        name: metricName.trim(),
        status: metricStatuses[index]?.trim() || "Active",
        target: metricTargets[index]?.trim() || "",
      };
      metrics.push(metric);
    });

    initiative.metrics = metrics;
    const initiativesByState = initiativesMap.get(state) || [];
    initiativesMap.set(state, [...initiativesByState, initiative]);
  }

  const initiativeObj = {};
  for (const [state, initiatives] of initiativesMap.entries()) {
    initiativeObj[state] = initiatives;
  }

  fs.writeFileSync(
    `./initiatives.json`,
    JSON.stringify(initiativeObj, null, 2)
  );
}

main();
