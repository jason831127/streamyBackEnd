const request = require('request');
const LineApiException = require('./LineApiException');

const AUTH_URL = 'https://access.line.me/oauth2/v2.1/authorize?';
const TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';
const PROFILE_URL = 'https://api.line.me/v2/profile';

/**
 * Line Social API SDK
 * Flow: https://developers.line.me/en/docs/line-login/web/integrate-line-login/
 * @param {Object} opt 
 */
function Line (opt) {
  if (!opt.clientId) throw new Error('line sdk clientId required');
  if (!opt.clientSecret) throw new Error('line sdk clientSecret required');
  this.clientId = opt.clientId;
  this.clientSecret = opt.clientSecret;
}

/**
 * Exchange access token
 * ref: https://developers.line.me/en/docs/social-api/getting-user-profiles/
 * @param {String} code 
 * @param {String} returnUrl 
 */
Line.prototype.getAccessToken = async function (code, returnUrl) {
  // Step2: [POST] Getting an access token
  // POST https://api.line.me/oauth2/v2.1/token
  var reqOptions = { 
    url: TOKEN_URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=authorization_code&code=${code}&redirect_uri=${returnUrl}&client_id=${this.clientId}&client_secret=${this.clientSecret}`
  };
  
  let res = null;
  try {
    res = await makeRequest(reqOptions);
  } catch (error) {
    throw error;
  }
  return res.access_token;
};

/**
 * Getting user profiles API
 * ref: https://developers.line.me/en/docs/social-api/getting-user-profiles/
 * @param {String} accessToken 
 */
Line.prototype.getUserProfile = async function (accessToken) {
  var reqOptions = {
    url: PROFILE_URL,
    headers: { 
      Authorization: 'Bearer ' + accessToken
    }
  };

  let res = null;
  try {
    res = await makeRequest(reqOptions);
  } catch (error) {
    throw error;
  }
  return res;
};

/**
 * Generate loging url
 * ref: https://developers.line.me/en/docs/social-api/getting-user-profiles/
 * @param {String} code 
 * @param {String} returnUrl 
 */
Line.prototype.getLoginUrl = function (returnUrl) {
  var loginUrl = AUTH_URL
    + '&response_type=code'
    + `&client_id=${this.clientId}`
    + `&redirect_uri=${returnUrl}`
    + `&state=${new Date().getTime().toString()}`
    + `&scope=profile`;

  return loginUrl;
};

async function makeRequest(options) {
  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) reject(error);
      else { 
        if (response.statusCode == 200) resolve(JSON.parse(body));
        else reject(new LineApiException(JSON.parse(body)));
      }
    });
  });
}

module.exports = Line;