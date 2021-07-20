const zipper = require("../index");
const { createWriteStream, existsSync } = require("fs");
const { join } = require("path");

jest.setTimeout(999999);

describe("Remote file zipper", () => {
  test("it should return a stream of data", () => {
    const input = {
      filename: "test.zip",
      files: [
        {
          filename: "image.png",
          url: "https://sdn.stillio.com/screenshots/1f/HYNXZZd80fUZI0KmQN1X/7aad3ee1-e0c7-11eb-b2b2-5d36ba0b8ec8.png",
        },
      ],
    };

    return zipper
      .zip(input)
      .then((result) => {
        expect(result.zipReadableStream).toBeInstanceOf(
          require("stream").PassThrough
        );
      })
      .catch((e) => e);
  });

  test("it should be able to zip a list of remote files.", () => {
    const input = {
      filename: "large.zip",
      files: Array(100)
        .fill(null)
        .map((_, index) => {
          return {
            filename: `img${index}.png`,
            url: "https://sdn.stillio.com/screenshots/1f/HYNXZZd80fUZI0KmQN1X/7aad3ee1-e0c7-11eb-b2b2-5d36ba0b8ec8.png",
          };
        }),
    };

    return zipper
      .zip(input)
      .then(({ zipReadableStream, zipFileName }) => {
        const writable = createWriteStream(join(__dirname, zipFileName));
        zipReadableStream.pipe(writable);

        writable.on("close", () => {
          expect(existsSync(join(__dirname, zipFileName))).toBe(true);
        });
      })
      .catch((e) => {
        throw e;
      });
  });

  test("it should fire the custom callback optionally on failure.", () => {
    let error;

    return zipper.zip({
      filename: "test.zip",
      files: [
        {
          filename: "error",
          url: "thisshouldbreak",
        },
      ],
      errorHandler: (e) => {
        error = e;
        expect(error).toBeTruthy();
      },
    });
  });
});
