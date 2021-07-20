const { request } = require("undici");

class Requestor {
  constructor(retries = 5) {
    this._maxRetries = retries;
    this._currentRetry = 0;
  }

  getBuffer(url, errorHandlerCallback) {
    return new Promise(async (resolve, reject) => {
      try {
        const buffer = [];
        const { body } = await request(url);

        for await (const data of body) {
          buffer.push(data);
        }

        this._currentRetry = 0;
        return resolve(Buffer.concat(buffer));
      } catch (error) {
        if (this._currentRetry < this._maxRetries) {
          this._currentRetry += 1;
          return resolve(this.getBuffer(url));
        } else if (typeof errorHandlerCallback === "function") {
          this._currentRetry = 0;
          return resolve(errorHandlerCallback(error));
        } else {
          this._currentRetry = 0;
          return reject(error);
        }
      }
    });
  }
}

module.exports = Requestor;
