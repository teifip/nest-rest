# nest-rest-api

Basic client for the [NEST REST APIs](https://developers.nest.com/documentation/cloud/rest-guide), including support to obtain and revoke [OAuth2](https://developers.nest.com/documentation/cloud/how-to-auth) access codes.

### Overview

```javascript
const nest = require('nest-rest-api');

// Instantiate the client
const client = nest.restApiClient(token);

// Make a read request
client.read('/devices/thermostats', (error, result) => {
  // Process result
});
```

All the request methods can either be invoked with callbacks (as in the example above) or return promises:

```javascript
client.read('/devices/thermostats').then(processResult);
```

```javascript
async function makeRequest() {
  let result = await client.read('/devices/thermostats');
}
```

Once instantiated, the client can be used for multiple subsequent requests:

```javascript
async function makeRequest() {
  let result = await client.read('/devices/thermostats');

  let otherResult = await client.read('/structures');
}
```

The client automatically follows [307 redirects](https://developers.nest.com/documentation/cloud/how-to-handle-redirects), including storing the redirected location for subsequent requests.

Support for [OAuth2](https://developers.nest.com/documentation/cloud/how-to-auth) operations is available through a dedicated set of functions:

```javascript
const oauth2 = require('nest-rest-api').oauth2;

oauth2.exchangeCodeForToken(code, (error, result) => {
  // Process result
});
```

### Installation

```
npm install nest-rest-api --save
```

### REST API client

The REST API client is instantiated as follows:

```javascript
const nest = require('nest-rest-api');

const client = nest.restApiClient(token);
```

`token` must be a valid [OAuth2](https://developers.nest.com/documentation/cloud/how-to-auth) access token (string). Once instantiated, the client has the read/write privileges determined by the scope of its access token.

**client.read(path[, callback])**

Initiates an [API read](https://developers.nest.com/documentation/cloud/how-to-read-data) call. `path` specifies the requested data relative to `https://developer-api.nest.com`. Must be a string starting with `/`.

If present, `callback` must be a function that expects `(error, result)` as input parameters. Otherwise, if `callback` is not present, then `nest.read()` returns a promise to resolve `result` or to catch `error`.

The `result` value is an object defined as follows:

| Property   | Description |
|:-----------|:------------|
| `success`  | Boolean    |
| `data`     | Object; data returned by the API server; only present if `success` is `true` |
| `response` | Object; entire response returned by the API server; see the [accept-json](https://github.com/teifip/accept-json) package documentation for details; only present if `success` is `false` |

**client.write(path, data[, calllback])**

Not currently supported. Will be added in future releases.

### OAuth2 utilities

Use of the OAuth2 functions specified in this section requires the OAuth2 client identifier and secret to be accessible through the `OAUTH2_CLIENT_ID` and `OAUTH2_CLIENT_SECRET` environment variables, respectively.

In addition, if you have registered multiple redirect URIs for the OAuth2 client and you intend to use a redirect URI other than the default one, then the selected redirect URI must be accessible through the `OAUTH2_REDIRECT_URI` environment variable. In all the other cases, the `OAUTH2_REDIRECT_URI` environment variable can be left undefined.

**oauth2.generateAuthorizationUrl(state)**

Returns the authorization URL as string. The OAuth2 flow starts with pointing the user's browser to this URL. `state` must be passed as string. Example:

```javascript
const oauth2 = require('nest-rest-api').oauth2;

let authUrl = oauth2.generateAuthorizationUrl('4Ya0caMziW');
```

**oauth2.exchangeCodeForToken(code[, callback])**

Initiates a request to exchange an authorization code for an access token. `code` must be passed as string.

If present, `callback` must be a function that expects `(error, result)` as input parameters. Otherwise, if `callback` is not present, then `oauth2.exchangeCodeForToken()` returns a promise to resolve `result` or to catch `error`.

The `result` value is an object defined as follows:

| Property   | Description |
|:-----------|:------------|
| `success`  | Boolean    |
| `token`    | String; only present if `success` is `true` |
| `expires`  | Integer; number of seconds remaining before the token expires from the time it was requested; only present if `success` is `true` |
| `response` | Object; entire response returned by the API server; see the documentation of the [accept-json](https://github.com/teifip/accept-json) package for details; only present if `success` is `false` |

Access tokens are generated with long term validity (10 years). Therefore, the expiration time can effectively be ignored.

**oauth2.revokeToken(token[, callback])**

Initiates a token revocation request. `token` must be passed as string.

> Access tokens have long term validity. It is really a good practice to revoke them when not needed any longer.

If present, `callback` must be a function that expects `(error, result)` as input parameters. Otherwise, if `callback` is not present, then `oauth2.revokeToken()` returns a promise to resolve `result` or to catch `error`.

The `result` value is an object defined as follows:

| Property   | Description |
|:-----------|:------------|
| `success`  | Boolean    |
| `revoked`     | Integer; equal to `1` if the submitted token was actually revoked; equal to `0` if the submitted token did no exist; only present if `success` is `true` |
| `response` | Object; entire response returned by the API server; see the documentation of the [accept-json](https://github.com/teifip/accept-json) package for details; only present if `success` is `false` |

Note that token revocation is considered successful both when the token is actually found and revoked (`204` response from the server) and when it is simply not found (`404` response from the server).
