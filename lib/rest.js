const apiClient = require('accept-json');
const REST_BASE_URL = 'https://developer-api.nest.com';

function RestApiClient(token) {
  this.options = { token: token, timeout: 3000 };
  this.mainClient = apiClient(REST_BASE_URL, this.options);
  this.redirectedClient = null;
}

function restApiRead(path, ...callbacks) {
  let client = this.redirectedClient || this.mainClient;

  client.get(path, (error, response) => {
    if (error && this.redirectedClient) {
      this.redirectedClient = null;
      restApiRead.call(this, path, ...callbacks);

    } else if (error) {
      callbacks[callbacks.length - 1](error);

    } else if (response.code === 307) {
      this.redirectedClient = apiClient(response.redirection, this.options);
      restApiRead.call(this, path, ...callbacks);

    } else if (response.code === 200 && callbacks.length === 1) {
      callbacks[0](null, { success: true, data: response.body });

    } else if (response.code === 200) {
      callbacks[0]({ success: true, data: response.body });

    } else if (callbacks.length === 1) {
      callbacks[0](null, { success: false, response: response });

    } else {
      callbacks[0]({ success: false, response: response });
    }
  });
}

RestApiClient.prototype.read = function(path, callback) {
  if (callback) {
    restApiRead.call(this, path, callback);
  } else {
    return new Promise((resolve, reject) => {
      restApiRead.call(this, path, resolve, reject);
    });
  }
}

module.exports = RestApiClient;
