const fs = require("fs");
const fastcsv = require("@fast-csv/parse");

const parseCSV = async (file) => {
  const data = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(file.path)
      .pipe(fastcsv.parse({ headers: true }))
      .on("error", (error) => {
        fs.unlinkSync(file.path);
        console.error(error);
        reject(error);
      })
      .on("data", (row) => {
        data.push(row);
      })
      .on("end", () => {
        fs.unlinkSync(file.path);
        console.log("CSV file successfully processed.");
        resolve(data);
      });
  });
};

module.exports = {
  parseCSV,
};
