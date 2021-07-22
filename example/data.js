module.exports = {
  filename: "test.zip",
  files: [
    {
      filename: "no-file.png",
    },
    {
      filename: "image-error.png",
      url: "http://not-a-real-image",
    },
    {
      filename: `image-should-write.png`,
      url: "http://localhost:4444/image.png",
    },
    {
      url: "http://localhost:4444/image.png",
    },
  ],
};
