const { createWriteStream, existsSync } = require("fs");
const { start, stop } = require("../mock/server");
const zipper = require("../index");
const { join } = require("path");

jest.setTimeout(999999);

beforeAll((done) => {
  start(done);
});

afterAll((done) => {
  stop(done);
});

describe("The queuer", () => {
  test("it should queue the list correctly", () => {
    const Queue = require("../src/modules/Queue");
    const myQueue = new Queue();
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    myQueue.divideAndEnqueueList(input, 3);

    expect(myQueue.items).toStrictEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10],
    ]);
  });
});

describe("Remote file zipper", () => {
  test("it should return a stream of data", () => {
    const input = {
      filename: "test.zip",
      files: [
        {
          filename: "image.png",
          url: "http://localhost:4444/image.png",
        },
      ],
    };

    return zipper.zip(input).then((result) => {
      expect(result.zipReadableStream).toBeInstanceOf(
        require("stream").PassThrough
      );
    });
  });

  test("it should continue zipping and emit file on fetch error", (done) => {
    const input = {
      filename: "test.zip",
      files: [
        {
          filename: "image.png",
          url: "http://localhost:4444/image.png",
        },
        {
          filename: "error.png",
          url: "http://so-not-a-real-image-url",
        },
      ],
    };

    zipper.zip(input).then(({ zipReadableStream, statusEmitter }) => {
      const writable = createWriteStream(join(__dirname, "error-continue.zip"));
      zipReadableStream.pipe(writable);

      writable.on("error", (e) => {
        throw e;
      });

      statusEmitter.on("error", (error) => {
        expect(error.file).toBeDefined();
      });

      writable.on("close", () => {
        expect(existsSync(join(__dirname, "error-continue.zip"))).toBe(true);
        done();
      });
    });
  });

  test("it should be able to zip a large list of remote files.", (done) => {
    const input = {
      filename: "large.zip",
      files: Array(10000)
        .fill(null)
        .map((_, index) => {
          return {
            filename: `image-${index}.png`,
            url: "http://localhost:4444/image.png",
          };
        }),
    };

    zipper.zip(input).then(({ zipReadableStream, zipFileName }) => {
      const writable = createWriteStream(join(__dirname, zipFileName));
      zipReadableStream.pipe(writable);

      writable.on("error", (e) => {
        throw e;
      });

      writable.on("close", () => {
        expect(existsSync(join(__dirname, zipFileName))).toBe(true);
        done();
      });
    });
  });
});
