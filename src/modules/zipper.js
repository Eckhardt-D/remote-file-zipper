const archiver = require("archiver");
const stream = require("stream");
const axios = require("axios").default;

module.exports = {
  /**
   * Zips a given set of screenshot URL's and returns the stream.
   * @param filename { string } The name of the file, defaults to test.zip.
   * @param screenshots { Array } The array of screenshot objects, of which at least a url property is required.
   */
  async zip({ filename = "test.zip", screenshots = [] }) {
    const archive = archiver("zip", { zlib: 9 });
    const zipReadableStream = new stream.PassThrough();

    if (!screenshots.length) {
      throw new Error("Screenshots must be a non-empty array.");
    }

    archive.on("error", (error) => {
      throw error;
    });

    archive.on("warning", (error) => {
      if (error.code === "ENOENT") {
        console.log(error.message);
      } else {
        throw error;
      }
    });

    archive.pipe(zipReadableStream);

    for (let index = 0; index < screenshots.length; index++) {
      const filename = screenshots[index].filename || `test-${index}.png`;

      const buffer = await axios
        .get(screenshots[index].url, {
          responseType: "arraybuffer",
        })
        .then((response) => response.data);

      archive.append(buffer, { name: filename });
    }

    archive.finalize();

    return {
      zipFileName: filename,
      zipReadableStream,
    };
  },
};
