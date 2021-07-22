module.exports = {
  filename: "test.zip",
  files: Array(5)
    .fill(null)
    .map((_, index) => {
      if (index === 4) {
        return {
          filename: "image-error.png",
          url: "http://not-a-real-image",
        };
      }
      return {
        filename: `image-${index}.png`,
        url: "http://localhost:4444/image.png",
      };
    }),
};
