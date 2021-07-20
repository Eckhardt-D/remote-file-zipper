const archiver = require("archiver");
const stream = require("stream");
const EventEmitter = require("events");
const Requestor = require("./Requestor");

module.exports = {
  /**
   * Zips a given set of screenshot URL's and returns the stream.
   * @param filename { string } The name of the file, defaults to test.zip.
   * @param files { Array } The array of remote file objects, of which at least a url property is required.
   * @param errorHandler { Function } A custom Error handler if all the retries on a fetch has failed or something went wrong with the zipper, defaults to a throw.
   */
  async zip({ filename = "test.zip", files = [], errorHandler }) {
    const emitter = new EventEmitter();
    const archive = archiver("zip", { zlib: 9 });
    const zipReadableStream = new stream.PassThrough();
    const request = new Requestor();

    if (!files.length) {
      throw new Error("Files must be a non-empty array.");
    }

    archive.on("error", (error) => {
      emitter.emit("error", error);
    });

    archive.on("warning", (error) => {
      if (error.code === "ENOENT") {
        emitter.emit("warning", error);
      } else {
        emitter.emit("error", error);
      }
    });

    archive.pipe(zipReadableStream);

    const fileBufferPromises = files.map((file) =>
      request.getBuffer(file.url, errorHandler)
    );

    try {
      const fileBuffers = await Promise.all(fileBufferPromises);

      fileBuffers.map((buffer, index) => {
        archive.append(buffer, { name: files[index].filename });
      });

      archive.finalize();

      return {
        zipFileName: filename,
        zipReadableStream,
        statusEmitter: emitter,
      };
    } catch (error) {
      if (typeof errorHandler === "function") {
        return errorHandler(error);
      } else {
        throw error;
      }
    }
  },
};
