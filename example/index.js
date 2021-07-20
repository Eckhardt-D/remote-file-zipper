const { join } = require("path");
const { createWriteStream } = require("fs");

const zipper = require("../index");
const mockData = require("./data");

zipper
  .zip(mockData)
  .then((result) => {
    const { zipFileName, zipReadableStream, statusEmitter } = result;

    statusEmitter.on("warning", console.log);
    statusEmitter.on("error", console.log);

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
