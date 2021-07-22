const { request } = require("undici");

class Requestor {
  constructor(retries = 5) {
    this._maxRetries = retries;
    this._currentRetry = 0;
  }

  async _makeBuffer(url) {
    try {
      this._currentRetry += 1;

      const buffer = [];
      const { body, statusCode } = await request(url);

      if (statusCode !== 200) {
        throw `URL: ${url}, Failed to fetch after ${this._currentRetry} tries.`;
      }

      for await (const data of body) {
        buffer.push(data);
      }

      return Buffer.concat(buffer);
    } catch (error) {
      throw error;
    }
  }

  _handleResponse(response, error = false) {
    this._currentRetry = 0;
    if (error) throw response;
    return response;
  }

  async getBuffer(url) {
    try {
      const response = await this._makeBuffer(url);
      return this._handleResponse(response);
    } catch (error) {
      if (this._currentRetry < this._maxRetries) {
        return await this.getBuffer(url);
      } else {
        throw this._handleResponse(error, true);
      }
    }
  }
}

module.exports = Requestor;
