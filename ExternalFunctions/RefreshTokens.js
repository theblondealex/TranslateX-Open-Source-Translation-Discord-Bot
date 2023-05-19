const axios = require("axios");
const path = require("path");
const oauth = require("oauth").OAuth;
const { request } = require("undici");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const oauth_consumer_key = process.env.TWITTER_CONSUMER_KEY;
const oauth_consumer_secret = process.env.TWITTER_CONSUMER_SECRET;

async function refresher(discrefresh) {
  try {
    const tokenResponseData = await request(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: process.env.CLIENTID,
          client_secret: process.env.CLIENTSECRET,
          grant_type: "refresh_token",
          refresh_token: discrefresh,
        }).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const oauthData = await tokenResponseData.body.json();
    return oauthData;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

module.exports = { refresher };

// async function test(discaccess, discrefresh) {
//   const test = await refresher(discaccess, discrefresh);
//   console.log(test);
// }

// test("rHc9FZaRNAfLnoJ5GML9353Xz8gxWC", "NqTDOYlZs8axtUYq5wwKQo9wmjoPCp");
