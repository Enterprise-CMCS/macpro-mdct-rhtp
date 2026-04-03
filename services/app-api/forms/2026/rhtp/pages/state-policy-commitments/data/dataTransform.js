/**
 * This is a utility for transforming a csv of state policy commitment
 * information into a json file. The function expects the csv data
 * in a certain format in order for the transformation to happen properly.
 *
 * in this directory, run `node dataTransform.js`
 */

const { STATE_POLICY_COMMITMENT_NAMES } = require("../constants.ts");
const fs = require("node:fs");

const headingMap = {
  state: "state",
  "state policy commitment": "label",
  status: "status",
};

const commitmentMap = new Map();

function main() {
  const file = fs.readFileSync("./commitments.csv").toLocaleString();
  const rows = file.split("\n"); // SPLIT ROWS
  const headings = rows.shift().split(",");
  rows.forEach((row, rowIndex) => {
    const commitment = {};
    let state = "";
    columns = row.split(","); //SPLIT COLUMNS
    columns.forEach((col, colIndex) => {
      const key = headingMap[headings[colIndex].trim()];
      if (key === "state") {
        state = col;
      } else if (
        key === "label" &&
        !STATE_POLICY_COMMITMENT_NAMES.includes(col.trim())
      ) {
        throw new Error(
          `Unexpected commitment name found in row ${rowIndex + 1}: ${col}. Please correct and rerun`
        );
      } else {
        commitment[key] = col.trim();
      }
    });
    const commitmentsByState = commitmentMap.get(state) || [];
    commitmentMap.set(state, [...commitmentsByState, commitment]);
  });

  const commitmentObj = {};
  for (const [state, commitments] of commitmentMap.entries()) {
    commitmentObj[state] = commitments;
  }

  fs.writeFileSync(
    `./commitments.json`,
    JSON.stringify(commitmentObj, null, 2)
  );
}

main();
