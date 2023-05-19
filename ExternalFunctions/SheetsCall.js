const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { google } = require("googleapis");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isIterable = (value) => {
  return Symbol.iterator in Object(value);
};

module.exports = async function getValues(sheetid, column) {
  const range = `${column}:${column}`;
  const service = google.sheets({ version: "v4" });
  const request = {
    // The spreadsheet to request.
    spreadsheetId: sheetid,
    // The ranges to retrieve from the spreadsheet.
    ranges: [range],
    auth: process.env.GAPIKEY,
  };

  try {
    let cellsarray = [];
    const response = await service.spreadsheets.values.batchGet(request);
    const valuesobj = response.data.valueRanges;
    const valuesarray = valuesobj[0].values;
    if (isIterable(valuesarray) == false) {
      console.log("not iterable");
      return 0;
    } else;
    for (const cell of valuesarray) {
      cellsarray.push(cell);
    }

    const stringarray = cellsarray.toString();
    const final = stringarray.split(",");
    return final;
  } catch (err) {
    const errors = err.errors;
    if ((errors[0].message = "The caller does not have permission")) {
      return 2;
    }
    // console.log(err);
  }
  return;
};
