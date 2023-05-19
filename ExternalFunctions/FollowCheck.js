const axios = require("axios");
const path = require("path");
const oauth = require("oauth").OAuth;

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

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

async function FollowCheck(twittaccess, twitsecret, twittocheck) {
  try {
    let res = await axios({
      method: "get",
      url: `https://api.twitter.com/1.1/friendships/lookup.json?user_id=${twittocheck}`,
      headers: {
        Authorization: oa.authHeader(
          `https://api.twitter.com/1.1/friendships/lookup.json?user_id=${twittocheck}`,
          twittaccess,
          twitsecret
        ),
      },
    });
    const connections = res.data[0].connections;
    return connections.includes("following");
  } catch (error) {
    if ((error.response.statusText = "Unauthorized")) {
      return false;
    } else {
      console.log("ERROR FC1", error);
      console.log("ERROR FC1", error.data);
    }
  }
}

module.exports = { FollowCheck };

// async function test() {
//   const outdated = await FollowCheck(

//   );
// }
// test();
