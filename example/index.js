const { join } = require("path");
const { createWriteStream } = require("fs");
const { start, stop } = require("../mock/server");

const zipper = require("../index");
const mockData = require("./data");

start(() => {
  zipper
    .zip(mockData)
    .then((result) => {
      const { zipFileName, zipReadableStream, statusEmitter } = result;

      statusEmitter.on("warning", console.log);

      statusEmitter.on("error", (error) => {
        // Do something with the failed item
        console.log(error.message, error.file);
      });

      const output = createWriteStream(join(__dirname, zipFileName), {
        encoding: "binary",
      });

      output.on("error", (err) => {
        throw err;
      });

      output.on("close", () => {
        console.log("Zip successfully written.");
        stop(() => console.log("stopped"));
      });

      zipReadableStream.pipe(output);
    })
    .catch(() => {
      stop(() => console.log("stopped"));
    });
});
