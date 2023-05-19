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

async function VerifyCreds(twittaccess, twitsecret) {
  try {
    let res = await axios({
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
    if (res.status == 200) {
      return res.data.id_str;
    } else if (res.status == 401) {
      console.log("false");
      return false;
    }
  } catch (error) {
    return false;
  }
}

//?tweet.fields=id=${tweettocheck}

async function LikeCheck(twittaccess, twitsecret, tweettocheck) {
  const uid = await VerifyCreds(twittaccess, twitsecret);
  //   console.log(uid);
  try {
    let res = await axios({
      method: "get",
      url: `https://api.twitter.com/1.1/statuses/show.json?id=${tweettocheck}`,
      headers: {
        Authorization: oa.authHeader(
          `https://api.twitter.com/1.1/statuses/show.json?id=${tweettocheck}`,
          twittaccess,
          twitsecret
        ),
      },
    });
    // console.log(res);
    const rep = res.data;
    return rep.favorited;
  } catch (error) {
    if ((error.response.statusText = "Unauthorized")) {
      console.log(error.response);
      return false;
    } else {
      console.log("ERROR FC1", error);
      console.log("ERROR FC1", error.data);
    }
  }
}

module.exports = { LikeCheck };

// async function test() {
//   const outdated = await FollowCheck(
//     "1247125859607228421-tqiHqtCQpuxTnpquqZqwbXLODXRALQ",
//     "TrV5fpVjhc2tmzqQts6wHk2H0moDg2J1jILNuKlZgkIqs",
//     "1616878021280993284"
//   );
//   console.log(outdated);
// }
// test();
