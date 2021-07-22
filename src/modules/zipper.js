const archiver = require("archiver");
const stream = require("stream");
const EventEmitter = require("events");
const Requestor = require("./Requestor");
const Queue = require("./Queue");

module.exports = {
  /**
   * Zips a given set of screenshot URL's and returns the stream.
   * @param filename { string } The name of the file, defaults to test.zip.
   * @param files { Array } The array of remote file objects, of which at least a url property is required.
   * @param queueLength { Number } The number of files to batch per request to avoid memory and remote server issues. default=100, max=500.
   */
  async zip({ filename = "test.zip", files = [], queueLength = 100 }) {
    const maxQueueLength = 500;

    if (!files.length) {
      throw new Error("Files must be a non-empty array.");
    }

    const emitter = new EventEmitter();
    const archive = archiver("zip", { zlib: 9 });
    const zipReadableStream = new stream.PassThrough();
    const request = new Requestor();

    if (queueLength > maxQueueLength) {
      emitter.emit("warning", "Queue length max exceeded, using max=1000.");
      queueLength = maxQueueLength;
    }

    archive.on("error", (error) => {
      emitter.emit("error", error);
    });

    archive.on("warning", (error) => {
      emitter.emit("warning", error);
    });

    archive.pipe(zipReadableStream);

    const queue = new Queue();
    queue.divideAndEnqueueList(files, queueLength);

    let lastProcessedIndex = 0;

    const processQ = async (head) => {
      const fileBufferPromises = head.map((file) =>
        request.getBuffer(file.url)
      );

      const fileBuffers = await Promise.allSettled(fileBufferPromises);

      for await (const buffer of fileBuffers) {
        if (buffer.status === "fulfilled") {
          archive.append(buffer.value, {
            name: files[lastProcessedIndex].filename,
          });
        } else {
          emitter.emit("error", {
            message: buffer.reason,
            file: files[lastProcessedIndex],
          });
        }

        lastProcessedIndex += 1;
      }

      if (!queue.isFullyProcessed()) {
        await processQ(queue.processHead());
      } else {
        archive.finalize();
      }
    };

    processQ(queue.processHead());

    return {
      zipFileName: filename,
      zipReadableStream,
      statusEmitter: emitter,
    };
  },
};
