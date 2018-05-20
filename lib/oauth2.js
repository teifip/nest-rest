const apiClient = require('accept-json');
const OAUTH2_BASE_URL = 'https://api.home.nest.com/oauth2';
const OAUTH2_LOGIN_URL = 'https://home.nest.com/login/oauth2';

function exchangeCodeForToken(code, ...callbacks) {
  if (!process.env.OAUTH2_CLIENT_ID || !process.env.OAUTH2_CLIENT_SECRET) {
    let msg = 'Missing OAUTH2_CLIENT_ID or OAUTH2_CLIENT_SECRET in environent';
    return callbacks[callbacks.length - 1](new Error(msg));
  }

  let client = apiClient(OAUTH2_BASE_URL, { timeout: 3000 });

  let options = {
    form: {
      client_id: process.env.OAUTH2_CLIENT_ID,
      client_secret: process.env.OAUTH2_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code
    }
  };

  client.post('/access_token', options, (error, response) => {
    if (error) {
      callbacks[callbacks.length - 1](error);

    } else if (response.code === 200 && callbacks.length === 1) {
      callbacks[0](null, {
        success: true,
        token: response.body.access_token,
        expires: response.body.expires_in
      });

    } else if (response.code === 200) {
      callbacks[0]({
        success: true,
        token: response.body.access_token,
        expires: response.body.expires_in
      });

    } else if (callbacks.length === 1) {
      callbacks[0](null, { success: false, response: response });

    } else {
      callbacks[0]({ success: false, response: response });
    }
  });
}

function revokeToken(token, ...callbacks) {
  let client = apiClient(OAUTH2_BASE_URL, { timeout: 3000 });

  client.delete(`/access_tokens/${token}`, (error, response) => {
    if (error) {
      callbacks[callbacks.length - 1](error);

    } else if (response.code === 204 && callbacks.length === 1) {
      callbacks[0](null, { success: true, revoked: 1 });

    } else if (response.code === 204) {
      callbacks[0]({ success: true, revoked: 1 });

    } else if (response.code === 404 && callbacks.length === 1) {
      callbacks[0](null, { success: true, revoked: 0 });

    } else if (response.code === 404) {
      callbacks[0]({ success: true, revoked: 0 });

    } else if (callbacks.length === 1) {
      callbacks[0](null, { success: false, response: response });

    } else {
      callbacks[0]({ success: false, response: response });
    }
  });
}

exports.generateAuthorizationUrl = function(state) {
  if (!process.env.OAUTH2_CLIENT_ID) {
    throw new Error('Missing OAUTH2_CLIENT_ID in environent');
  }

  let stateSafe = encodeURIComponent(state);
  let query = `client_id=${process.env.OAUTH2_CLIENT_ID}&state=${stateSafe}`;

  if (process.env.OAUTH2_REDIRECT_URI) {
    let redirectSafe = encodeURIComponent(process.env.OAUTH2_REDIRECT_URI);
    query += `&redirect_uri=${redirectSafe}`;
  }

  return `${OAUTH2_LOGIN_URL}?${query}`;
}

exports.exchangeCodeForToken = function(code, callback) {
  if (callback) {
    exchangeCodeForToken(code, callback);
  } else {
    return new Promise((resolve, reject) => {
      exchangeCodeForToken(code, resolve, reject);
    });
  }
}

exports.revokeToken = function(token, callback) {
  if (callback) {
    revokeToken(token, callback);
  } else {
    return new Promise((resolve, reject) => {
      revokeToken(token, resolve, reject);
    });
  }
}
