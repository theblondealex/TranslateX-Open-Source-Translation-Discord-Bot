const path = require("path");
const axios = require("axios");
const { Verify } = require("crypto");
const oauth = require("oauth").OAuth;

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const oauth_consumer_key = process.env.TWITTER_CONSUMER_KEY;
const oauth_consumer_secret = process.env.TWITTER_CONSUMER_SECRET;

var oa = new oauth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  oauth_consumer_key, // CONSUMER KEY
  oauth_consumer_secret, // CONSUMER SECRET
  "1.0",
  "https://mrrolebot.com/oauthcallback",
  "HMAC-SHA1"
);

async function VerifyCreds(twittaccess, twitsecret) {
  try {
    const res = await axios({
      method: "get",
      url: `https://api.twitter.com/1.1/account/verify_credentials.json`,
      headers: {
        Authorization: oa.authHeader(
          `https://api.twitter.com/1.1/account/verify_credentials.json`,
          twittaccess,
          twitsecret
        ),
      },
    });
    return res.status === 200;
  } catch (error) {
    console.log(error);
    console.log("VERIFY CREDENTIALS ERROR");
    return false;
  }
}

module.exports = { VerifyCreds };
