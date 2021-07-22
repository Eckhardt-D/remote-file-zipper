const express = require("express");
const { join } = require("path");
const app = express();

app.use("/", express.static(join(__dirname, "static")));

const server = require("http").createServer(app);

module.exports = {
  start(callback) {
    server.listen(4444, callback);
  },
  stop(callback) {
    server.close(callback);
  },
};
