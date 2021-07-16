const { join } = require("path");
const { createWriteStream } = require("fs");

const zipper = require("../dist/index");
const mockData = require("./data");

console.log(zipper);

zipper
  .zip(mockData)
  .then((result) => {
    const { zipFileName, zipReadableStream } = result;
    const output = createWriteStream(join(__dirname, zipFileName), {
      encoding: "binary",
    });

    output.on("error", (err) => {
      throw err;
    });

    output.on("close", () => {
      console.log("Zip successfully written.");
    });

    zipReadableStream.pipe(output);
  })
  .catch((error) => {
    console.log(error);
    process.exit();
  });
