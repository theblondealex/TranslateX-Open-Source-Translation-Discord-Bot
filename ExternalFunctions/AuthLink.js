const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const http = require("http");
const oauth = require("oauth").OAuth;
const { TwitTempUserAdd, FindTemp } = require("./DBCalls");

const oauth_consumer_key = process.env.TWITTER_CONSUMER_KEY;
const oauth_consumer_secret = process.env.TWITTER_CONSUMER_SECRET;

var reqToken; // This will change!
var reqTokenSecret;

var oa = new oauth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  oauth_consumer_key, // CONSUMER KEY
  oauth_consumer_secret, // CONSUMER SECRET
  "1.0",
  "https://mrrolebot.com/oauthcallback",
  "HMAC-SHA1"
);

async function getAuthlink(discid, cb) {
  const promise = new Promise((resolve, reject) => {
    oa.getOAuthRequestToken(function (error, token, secret, results) {
      resolve({
        token,
        secret,
      });
    });
  });
  var oauth = await promise;
  const url = `https://api.twitter.com/oauth/authorize?oauth_token=${oauth.token}`;
  await TwitTempUserAdd(discid, `${oauth.token}`);
  return url;
}

module.exports = { getAuthlink };
