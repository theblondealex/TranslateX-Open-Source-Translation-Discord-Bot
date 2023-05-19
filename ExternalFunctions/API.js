const path = require("path");
const timestamp = Date.now();
const { request } = require("undici");

const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  GatewayIntentBits,
  WebhookClient,
  AttachmentBuilder,
  Attachment,
} = require("discord.js");

const url = require("url");

const axios = require("axios");

const oauth = require("oauth").OAuth;

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const {
  TwitTempUserFind,
  UserInfoLongAddTwit,
  TwitTempUserDelete,
  DiscordTempUserDelete,
  GAPullActive,
  DiscordTempUserFind,
  UserInfoDiscUpdate,
  UserInfoTwitUpdate,
  UserInfoLongAddDisc,
  UserInfoCheck,
  GAEndedCheck,
} = require("./DBCalls");

const { EndGA } = require("./GAEnded");

const express = require("express");
const app = express();

const discclient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

discclient.login(process.env.BOTTOKEN);

app.listen(process.env.PORT || 80, "0.0.0.0", async () => {
  console.log(`Server running on port ${process.env.PORT || 80}`);
  console.log("LFG");
  const activegas = await GAPullActive();
  const active = await GAPullActive();
  const activecondensed = await active.map((element) => {
    return [element.customid, element.endtimestamp, element.ended];
  });
  for (const ga of activecondensed) {
    if (ga[2] == true) {
      continue;
    }
    const timestamp = Math.round(Date.now() / 1000);
    const timeleft = ga[1] - timestamp;
    const timouttime = timeleft * 1000;
    setTimeout(async () => {
      const hasended = await GAEndedCheck(customid);
      if (hasended != true) {
        await EndGA(discclient, ga[0]);
      }
    }, timouttime);
  }
});

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

app.get("/oauthcallback", async function (req, res) {
  oa.getOAuthAccessToken(
    req.query.oauth_token,
    reqTokenSecret,
    req.query.oauth_verifier,
    async function (error, oAuthAccessToken, oAuthAccessTokenSecret, results) {
      if (error) {
        console.log(error);
        return;
      }
      const incache = await TwitTempUserFind(req.query.oauth_token);
      if (incache != "") {
        const discid = incache[0].discid;
        const uid = incache[0].uid;
        if (req.query.oauth_token == uid) {
          const exists = await UserInfoCheck(discid);
          if (exists != 0) {
            //update and add the twitter account
            const updatetwit = await UserInfoTwitUpdate(
              oAuthAccessToken,
              oAuthAccessTokenSecret,
              results.user_id,
              results.screen_name,
              discid
            );
            if (updatetwit != 0) {
              console.log("deleteing from temp db");

              const deleted = await TwitTempUserDelete(discid);
              if (deleted == 1) {
                console.log("successfully saved credentials");
              }
            } else {
              console.log("shit12");
            }
          } else {
            //add a new user entry to the user_info table
            const add = await UserInfoLongAddTwit(
              discid,
              oAuthAccessToken,
              oAuthAccessTokenSecret,
              results.user_id,
              results.screen_name,
              null,
              timestamp
            );
            if (add == 1) {
              const deleted = await TwitTempUserDelete(discid);
              if (deleted == 1) {
                console.log("succesfully saved credentials");
              }
            } else {
              console.log(add);
              console.log("shit21");
            }
          }
          //if it success adding to long db delete from temp
        } else console.log("error not in DB");
      }
      res.redirect("https://twitter.com/MrRolebot");
    }
  );
});
app.get("/", async function (req, res) {
  res.sendFile(path.join(__dirname, "APIhomepage.html"));
});

app.post("/startga", async function (req, res) {
  res.status(200).send("success");
  const endstamp = req.query.endstamp;
  const customid = req.query.customid;
  const timestamp = Math.round(Date.now() / 1000);
  const timeleft = endstamp - timestamp;
  const timouttime = timeleft * 1000;
  setTimeout(async () => {
    const hasended = await GAEndedCheck(customid);
    if (hasended != true) {
      await EndGA(discclient, customid);
    }
  }, timouttime);
});

app.get("/discauthed", async function (req, res) {
  //steves server
  const usrcode = req.query.code;
  console.log(usrcode);
  console.log(process.env.CLIENTID, process.env.CLIENTSECRET);
  try {
    const tokenResponseData = await request(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: process.env.CLIENTID,
          client_secret: process.env.CLIENTSECRET,
          code: usrcode,
          grant_type: "authorization_code",
          redirect_uri: `https://mrrolebot.com/discauthed`,
          scope: ["identify", "guilds", "guilds.members.read"],
        }).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const oauthData = await tokenResponseData.body.json();

    const discordToken = oauthData.access_token;
    const discordrefresh = oauthData.refresh_token;
    const discordexpires = oauthData.expires_in;

    const state = req.query.state;

    const timestamp = parseInt(Date.now() / 1000);
    const tokenexpires = Math.round(timestamp + parseInt(discordexpires));
    const checkuid = await DiscordTempUserFind(state);
    if (checkuid != 0) {
      const discid = checkuid[0].discid;
      if (state == checkuid[0].uid) {
        const exists = await UserInfoCheck(discid);
        if (exists != 0) {
          console.log("exists");

          //update and add the discord account
          const updatedisc = await UserInfoDiscUpdate(
            discordToken,
            tokenexpires,
            discordrefresh,
            discid
          );
          if (updatedisc == 1) {
            const deleted = await DiscordTempUserDelete(discid);
            if (deleted == 1) {
              console.log("successfully saved credentials");
            }
          } else {
            console.log("shit3");
          }
        } else {
          //add a new user entry to the user_info table
          const add = await UserInfoLongAddDisc(
            discid,
            null,
            null,
            null,
            null,
            null,
            null,
            discordToken,
            tokenexpires,
            discordrefresh
          );
          if (add == 1) {
            const deleted = await DiscordTempUserDelete(discid);
            if (deleted == 1) {
              console.log("successfully saved credentials");
            }
          } else {
            console.log("shit4");
          }
        }
      }
    }

    res.redirect("https://twitter.com/MrRolebot");
  } catch (error) {
    // NOTE: An unauthorized token will not throw an error
    // tokenResponseData.statusCode will be 401
    console.error(error);
  }

  // And parse the response
});
