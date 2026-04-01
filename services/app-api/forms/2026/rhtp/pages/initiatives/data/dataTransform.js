/**
 * This is a utility for transforming a csv of initiative information
 * into a json file. The function expects the csv data in a certain
 * format in order for the transformation to happen properly.
 *
 * in this directory, run `node dataTransform.js`
 */

const fs = require("node:fs");

const headingMap = {
  state: "state",
  "initiative name": "title",
  "initiative number": "initiativeNumber",
  "initiative narrative": "narrative",
  "initiative status": "status",
  "initiative - metrics name(s) (semicolon-separated)": "metrics",
  "metric status(es) (semicolon-separated)": "metricStatuses",
};

const initiativesMap = new Map();

function main() {
  const file = fs.readFileSync("./initiatives.csv").toLocaleString();
  const rows = file.split("\n"); // SPLIT ROWS
  const headings = rows.shift().split(",");
  rows.forEach((row) => {
    const initiative = {
      id: crypto.randomUUID(),
    };
    let state = "";
    let metrics = [];
    let metricList = [];
    let metricStatuses = [];
    columns = row.split(","); //SPLIT COLUMNS
    columns.forEach((col, index) => {
      const key = headingMap[headings[index].trim()];
      if (key === "state") {
        state = col;
      } else if (key === "metrics") {
        metricList = col.split(";");
      } else if (key === "metricStatuses") {
        metricStatuses = col.split(";");
      } else {
        initiative[key] = col.trim();
      }
    });
    metricList.forEach((metricName, index) => {
      const metric = {
        name: metricName.trim(),
        status: metricStatuses[index].trim(),
      };
      metrics.push(metric);
    });
    initiative.metrics = metrics;
    const initiativesByState = initiativesMap.get(state) || [];
    initiativesMap.set(state, [...initiativesByState, initiative]);
  });

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
