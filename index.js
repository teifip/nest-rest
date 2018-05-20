const oauth2 = require('./lib/oauth2.js');
const RestApiClient = require('./lib/rest.js');

exports.restApiClient = function(token) {
  return new RestApiClient(token);
}

exports.oauth2 = oauth2;
