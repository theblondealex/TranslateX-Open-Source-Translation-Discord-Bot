const {
  TwitPullOutDatedTemp,
  TwitTempUserDelete,
  UserInfoPullCreds,
  PWsPull,
  PWsDelete,
  GAPanelDelete,
  GAPullOutDated,
  UserRelationsDelete,
  UserInfoDiscAccessPullAll,
  UserInfoDiscUpdate,
  UserInfoTwitUpdate,
  UserInfoRemoveDiscInfo,
  UserInfoRemoveTwitInfo,
  UserInfoPullNull,
} = require("./DBCalls.js");
const fs = require("node:fs");
const path = require("node:path");
const { FollowCheck } = require("./FollowCheck.js");
const { VerifyCreds } = require("./VerifyCreds.js");
const { refresher } = require("./RefreshTokens.js");
const { request } = require("undici");
const axios = require("axios");
const oauth = require("oauth").OAuth;
const Bottleneck = require("bottleneck");
const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 15000,
});

const {
  ActivityType,
  Client,
  Collection,
  GatewayIntentBits,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  Events,
  WebhookClient,
} = require("discord.js");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const webhook = process.env.TWITUSRHOOK;
const info = webhook.split("/api/webhooks/");
const hookarr = info[1].split("/");
const webhookToken = hookarr[hookarr.length - 1];
const webhookId = hookarr[hookarr.length - 2];
const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const oauth_consumer_key = process.env.TWITTER_CONSUMER_KEY;
const oauth_consumer_secret = process.env.TWITTER_CONSUMER_SECRET;

const oa = new oauth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  oauth_consumer_key,
  oauth_consumer_secret,
  "1.0",
  "https://mrrolebot.com/oauthcallback",
  "HMAC-SHA1"
);

client.login(process.env.BOTTOKEN);
client.once("ready", async () => {
  console.log("Ready!");

  //delete temp users every 5 secs
  setInterval(async () => {
    const outdated = await TwitPullOutDatedTemp();
    if (outdated == undefined) {
      return;
    } else {
      for (const row of outdated) {
        await TwitTempUserDelete(row.discid);
      }
    }
  }, 5000);

  //delete empty users every 5 secs
  // setInterval(async () => {
  //   const outdated = await UserInfoPullNull();
  //   if (outdated == 0 || "") {
  //     return;
  //   } else {
  //     for (const row of outdated) {
  //       await UserInfoDelete(row.discid);
  //     }
  //   }
  // }, 5000);

  //delete day old Giveaways
  // setInterval(async () => {
  //   const outdated = await GAPullOutDated();
  //   if (outdated == undefined) {
  //     return;
  //   } else {
  //     for (const row of outdated) {
  //       await GAPanelDelete(row);
  //     }
  //   }
  // }, 10000);

  //pull all about to expired discord tokens and then refresh them
  function isWithin5MinutesOrInThePast(timestamp) {
    const currentTime = Date.now() / 1000;
    const timeDifference = currentTime - timestamp;
    const fiveMinutes = 5 * 60;
    return timeDifference >= -fiveMinutes;
  }
  setInterval(async () => {
    try {
      const outdated = await UserInfoDiscAccessPullAll();
      if (outdated == 0) {
        return;
      } else {
        let abouttoexpire = [];
        for await (const row of outdated) {
          if (isWithin5MinutesOrInThePast(row.discordexpires) == true) {
            abouttoexpire.push(row);
          }
        }
        for await (const row of abouttoexpire) {
          const timestamp = parseInt(Date.now() / 1000);
          const refresh = await refresher(row.discordexpires);
          if (refresh != 0) {
            const tokenexpires = Math.round(
              timestamp + parseInt(refresh.expires_in)
            );
            const updateddisc = await UserInfoDiscUpdate(
              refresh.access_token,
              tokenexpires.toString,
              refresh.refresh_token,
              row.discordid
            );
          }
        }
      }
    } catch (error) {
      console.log(error, "ERROR RCREFRESHING");
    }
  }, 10000);

  //recursively check for deauthed discord users and remove them from DB
  setInterval(async () => {
    try {
      const alldisc = await UserInfoDiscAccessPullAll();
      if (alldisc == 0) {
        return;
      } else {
        for await (const row of alldisc) {
          // show user info to check
          const userResult = await request(
            "https://discord.com/api/users/@me",
            {
              headers: {
                authorization: `Bearer ${row.discordaccess}`,
              },
            }
          );
          const info = await userResult.body.json();
          if (info.message == "401: Unauthorized") {
            // console.log("UNAUTHORIZED");
            try {
              await UserInfoRemoveDiscInfo(row.discordid);
            } catch (error) {
              console.log(error, "ERROR GE8.313e");
            }
          }
          // const updateddisc = await UserInfoDiscUpdate(
          //   refresh.access_token,
          //   tokenexpires.toString,
          //   refresh.refresh_token,
          //   row.discordid
          // );
        }
      }
    } catch (error) {
      console.log(error, "ERROR RCREFRESHING");
    }
  }, 5000);

  //pull and delete expired pws
  setInterval(async () => {
    const pws = await PWsPull();
    const expiredorempty = pws.filter(
      (obj) =>
        parseInt(obj.expirestimestamp) < Date.now() / 1000 || obj.uses <= 0
    );
    if (expiredorempty.length > 0) {
      for (const item of expiredorempty) {
        const deletepw = await PWsDelete(
          item.password,
          item.serverid,
          item.msgid
        );
        if (deletepw != 1) {
          console.log("ERROR RCDP");
        }
      }
    }
  }, 1500);
});

// async function recursiveChecker(guildid) {
//   try {
//     let membersremove = [];
//     let serverdata = await PWPanelPull(guildid);
//     const twitidtofollow = serverdata[0].TwitterID;
//     const twittofollow = serverdata[0].TwitterUsername;
//     const roletogive = serverdata[0].RoleID;
//     let memberswithrole = [];

// let server = client.guilds.cache.get(guildid);
//     let members = await server.members.fetch();
//     try {
//       let rolemembers = server.roles.cache.get(roletogive).members;
//       const rolesize = rolemembers.size;
//       try {
//         if (rolesize > 0) {
//           rolemembers.forEach((element) => {
//             const uid = String(element.user.id);
//             memberswithrole.push(uid);
//           });
//           for (const member of memberswithrole) {
//             try {
//               //check if they got removed from DB
//               let userinfo = await UserInfoCheck(member);
//               if (userinfo == "") {
//                 const pullmember = await server.members.fetch(member);
//                 pullmember.roles.remove(roletogive);
//                 webhookClient.send({
//                   content: `<@${member}> [${member}] was removed from the role for unfollowing [${twitidtofollow}] in ${guildid}`,
//                 });
//                 return;
//               } else {
//                 //check if they unfollowed/deauthed
//                 let followcheck = await FollowCheck(
//                   userinfo[0].access,
//                   userinfo[0].secret,
//                   twitidtofollow
//                 );
//                 if (followcheck == false) {
//                   const pullmember = await server.members.fetch(member);
//                   pullmember.roles.remove(roletogive);
//                   webhookClient.send({
//                     content: `<@${member}> [${member}] was removed from the role for unfollowing [${twitidtofollow}] in ${guildid}`,
//                   });
//                   return;
//                 } else {
//                   continue;
//                 }
//               }
//             } catch (error) {
//               console.log(error);
//             }
//           }
//           console.log(`Checked Server ${guildid}`);
//         } else {
//           return;
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     } catch (error) {
//       console.log(`ERROR WITH ${guildid}`, error);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

// let servers = await PullGuilds();
// async function doWorkcheck(iterator) {
//   for (const value of iterator) {
//     recursiveChecker(value);
//   }
// }

// const followrepeat = async function () {
//   const iterator = Array.from(servers).values();
//   const workers = new Array(10).fill(iterator).map(doWorkcheck);
//   await Promise.allSettled(workers);
// };
// setInterval(async () => {
//   followrepeat();
// }, 915000);
