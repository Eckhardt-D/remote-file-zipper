# Remote File Zipper

This package allows the client to pass a large array of files to zip them.

### Installation

```bash
yarn add remote-file-zipper
```

or

```bash
npm i remote-file-zipper
```

### Usage

```js
const zipper = require("remote-file-zipper");
const path = require("path");
const fs = require("fs");

const payload = {
  filename: "myZippedFile.zip",
  files: [
    {
      filename: "image.png",
      url: "https://images.theconversation.com/files/350865/original/file-20200803-24-50u91u.jpg",
    },
  ],
  queueLength: 100,
};

zipper
  .zip(payload)
  .then(({ zipFileName, zipReadableStream, statusEmitter }) => {
    statusEmitter.on("warning", (error) => {
      console.log(error);
    });

    statusEmitter.on("error", (error) => {
      const singleFileError = typeof error.file !== "undefined";

      if (singleFileError) {
        // There was an error with one file, the rest zips as normal
        console.log(error.message, error.file);
      } else {
        // There was an error with the zipping as a whole, exits.
        console.log(error);
      }
    });

    const output = fs.createWriteStream(path.join(__dirname, zipFileName), {
      encoding: "binary",
    });

    output.on("error", (error) => {
      // There was an error writing your file
      console.log(error);
    });

    output.on("close", () => {
      console.log("Zip successfully written.");
    });

    zipReadableStream.pipe(output);
  })
  .catch((error) => {
    // There was some uncaught error
    console.log(error);
  });
```

## Methods

#### Zip

```
zip({ filename: String, files: Array<{filename: String, url: String}>, queueLength: Number }) : Promise()
```

- `filename`: The name of the final zipped file. `default: test.zip`
- `files`: The file object `required`
  - `filename`: The name of the file within the zip. `required`
  - `url`: The URL of the remote file. `required`
- `queueLength`: The size of each request queue. `default: 100, max: 500`.

### queueLength information

By default the libray implements a batched request to the files and simultaneuously processes that amount of buffers in memory. If your remote files are large, it's recommended to lower the queueLength to avoid memory and remote server problems. If you're experiencing issues with rate e.g. making too many simultaneuous requests to a file - try lower this too.

### Performance

You can test it yourself by cloning the repo and running:

```
yarn && yarn test
```

##### NB: These tests run a local server that serves a single image, one test requests this image 10,000 times which consumes around 1.9GB of storage locally, but proves the resillience.

### Contributions

Just do the thing. No guidelines yet. 🤠

### Support

[Buy me a coffee](https://kaizen.com.na/payment?ref=DONO)
