## Zipper

### Getting started

Clone this repo and then install deps:

```
yarn // or npm i
```

### Example

This example will use the mockData to generate a zip in the example folder. It showcases status updates from the status emitter and how failed requests, missing urls and filenames are handled.

```
yarn example
```

### Testing

Run `yarn test` or `npm run test`. NB: There is a test for zipping 10,000 files from the mock server. This file is around ~2GB.

### Usage

```js
const zipper = require("<path-to-zipper>");
const { zipFileName, zipReadableStream, statusEmitter } = await zipper.zip(
  {
    filename: 'myfile.zip',
    files: [
      {
        url: 'remote-server/file.png', // Required
        filename: 'filename.png', // Required
      }
    ]
  }
);
```

### Zip file data and naming.

The zipper accepts an object as outlined in `example/data.js`. If filename or url is omitted from the file object, that file will not get zipped.


### Returns

The Async function returns 2 properties, `zipFileName` for convenience and `zipReadableStream`, which is an implementation of `stream.PassThrough` and where the archive is piped through and `statusEmitter` which can be used to catch errors like:

- Failed being fetched. (Will continue zipping rest)
- Was missing parameters. (Will continue zipping rest)
- Archiving errors. (Will not continue the zipping)
