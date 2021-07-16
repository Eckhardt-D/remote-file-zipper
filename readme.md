## Zipper

### Getting started

Clone this repo and then install deps:

```
yarn // or npm i
```

### Example

This example will use the mockData to generate a zip in the example folder.

```
yarn test
```

### Usage

```js
const zipper = require("<path-to-zipper>");
const { zipFileName, zipReadableStream } = await zipper.zip(
  dataObject /* Check `example/data.js` for the payload.*/
);
```

### Zip file data and naming.

The zipper accepts an object as outlined in `example/data.js`. If filename is ommited, the lib will default to `test.zip`.

#### Screenshots

The screenshots should be an object with a filename and a url. This allows the user to decide on filenaming and if ommitted, defaults to `image-x.png` where x is the index of the image in the Array.

### Returns

The Async function returns 2 properties, `zipFileName` for convenience and `zipReadableStream`, which is an implementation of `stream.PassThrough` and where the archive is piped through.
