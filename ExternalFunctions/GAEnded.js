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

const { request } = require("undici");

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const webhook = process.env.GAHOOK;
const info = webhook.split("/api/webhooks/");
const hookarr = info[1].split("/");
const webhookToken = hookarr[hookarr.length - 1];
const webhookId = hookarr[hookarr.length - 2];
const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

const authimage = new AttachmentBuilder(
  path.join(__dirname, "../Buttons/authimage.png")
);

const oauth = require("oauth").OAuth;
const {
  GAPullServer,
  EntriesPullGA,
  UserInfoPullCreds,
  UserInfoCheck,
  GAPanelDelete,
  GAAddorUpdateCSVs,
  GAUpdateDrawn,
} = require("../ExternalFunctions/DBCalls");
const { getAuthlink } = require("../ExternalFunctions/AuthLink");
const { FollowCheck } = require("../ExternalFunctions/FollowCheck");
const { RTCheck } = require("../ExternalFunctions/RTCheck");
const { LikeCheck } = require("../ExternalFunctions/LikeCheck");
const { VerifyCreds } = require("./VerifyCreds");
const { auth } = require("google-auth-library");
const { create } = require("domain");

// const client = new Client({
//   intents: [
//     GatewayIntentBits.Guilds,
//     GatewayIntentBits.GuildMembers,
//     GatewayIntentBits.GuildMessages,
//     GatewayIntentBits.GuildMessageReactions,
//   ],
// });

//define random entry picker
function pickRandomEntries(entriesarr, x) {
  let result = [];
  let copy = [...entriesarr];

  if (x >= copy.length) {
    return copy;
  }

  for (let i = 0; i < x; i++) {
    let index = Math.floor(Math.random() * copy.length);
    result.push(copy[index]);
    copy.splice(index, 1);
  }

  return result;
}

// client.login(process.env.BOTTOKEN);
// module.exports =
async function EndGA(intclient, customid) {
  let successfulentries = [];
  const data = await GAPullServer(customid);
  //pull data
  const timestamp = Math.round(Date.now / 1000) + 10;
  const {
    serverid,
    servername,
    twitterid,
    twitterusername,
    messageid,
    winnerrole,
    channelid,
    endtimestamp,
    winneramount,
    prize,
    tweettolike,
    tweettort,
    requiredrole,
    createdby,
    serverneededid,
    walletneeded,
  } = data[0];
  //check ended is correct
  if (endtimestamp > timestamp) {
    return;
  }
  const icon = new AttachmentBuilder(
    path.join(__dirname, "theblondealexicon.png")
  );

  //pull all entries
  const entries = await EntriesPullGA(customid);
  //edit embed to invalid button and drawing stage
  //cache the channel
  const guild = await intclient.guilds.fetch(serverid);
  const channel = await intclient.channels.fetch(channelid);

  //clear all people wiht the role first
  // get all users with the role first
  const roletest = await guild.roles.fetch(winnerrole);
  let rolemembers = roletest.members;
  let memberswithrole = [];
  rolemembers.forEach((element) => {
    const uid = String(element.user.id);
    memberswithrole.push(uid);
  });
  for await (const id of memberswithrole) {
    //check if user is real user
    try {
      await intclient.users.fetch(id);
      try {
        const member = await guild.members.fetch(id);
        member.roles.remove(winnerrole);
      } catch (error) {
        console.log(error);
      }
    } catch (err) {
      console.log(err);
    }
  }

  //cache msg to edit
  try {
    const msg = await channel.messages.fetch(messageid);
    try {
      const loading = new AttachmentBuilder(
        path.join(__dirname, "loadinggif.gif")
      );
      let giveawayembed = new EmbedBuilder()
        .setColor("33FFAF")
        .setTitle(`Drawing Giveaway`)
        .addFields({
          name: "Prize",
          value: `\`\`\`yaml\n${prize}\n\`\`\``,
        })
        // .addFields(entryreqfields)
        .setImage("attachment://loadinggif.gif")
        .setDescription("If this gets stuck please contact Alexander.#0001")
        .setFooter({
          text: "Brought to you by Mr Rolebot - @MrRolebot",
        });
      const rowenter = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`giveaway_NoTwitter_`)
          .setLabel("Enter")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true)
      );
      await msg.edit({
        embeds: [giveawayembed],
        files: [loading],
        components: [rowenter],
      });
    } catch (error) {
      console.log(error);
    }

    //import the checkdiscord function
    async function guildcheck(guild, access) {
      //show their guilds specific info
      const guildsallresult = await request(
        "https://discord.com/api/users/@me/guilds",
        {
          headers: {
            authorization: `Bearer ${access}`,
          },
        }
      );
      const guildsarr = await guildsallresult.body.json();
      function checkIdExists(arr, id) {
        return arr.some((obj) => obj.id === id);
      }
      const inarr = checkIdExists(guildsarr, guild);
      return inarr;
    }
    //import the twitter reqs check function
    async function twitreqscheck(interaction, access, secret) {
      //serialise their DB info
      //if followtwitter !null do they follow it?
      if (twitterid != null) {
        //check they are following
        try {
          const isfollowing = await FollowCheck(access, secret, twitterid);
          if (isfollowing != true) {
            //they are not following return and tell them
            try {
              return 0;
            } catch (error) {
              console.log(error, "ERROR GE2");
            }
            return;
          }
        } catch (error) {
          console.log("ERROR CL1", error, "ERROR GE3");
        }
      }
      //if RT Tweet !null do they RT it?
      if (tweettort != null) {
        //check they have RT'd it
        try {
          const hasretweeted = await RTCheck(access, secret, tweettort);
          if (hasretweeted != true) {
            //they have not RT't return and tell them
            try {
              return 0;
            } catch (error) {
              console.log(error, "ERROR GE4");
            }
            return;
          }
        } catch (error) {
          console.log("ERROR GE5", error);
        }
      }
      //if like Tweet !null do they RT it?
      if (tweettolike != null) {
        //check they have liked it
        try {
          const hasliked = await LikeCheck(access, secret, tweettolike);
          if (hasliked != true) {
            //they have not RT't return and tell them
            try {
              return 0;
            } catch (error) {
              console.log(error, "ERROR GE6");
            }
            return;
          }
        } catch (error) {
          console.log("ERROR GE7", error);
        }
      }
      return 1;
    }

    //pull the array of entrants
    if (entries.length == 0) {
      let embedcomplete = new EmbedBuilder()
        .setColor("33FFAF")
        .setTitle("Giveaway Ended!")
        .setDescription(
          `There were no winners, as nobody successfully Entered!`
        )
        .setFooter({
          text: "Brought to you by Mr Rolebot - @MrRolebot",
        });
      await GAUpdateDrawn(customid);
      const embed = new EmbedBuilder()
        .setTitle("GA Results Drawn")
        .setColor("Red")
        .setDescription(
          `Giveaway winners drawn in ${servername} -[\`${serverid}\`] - [\`${customid}\`]\n\n**THERE WERE NO WINNERS RIP**`
        );
      webhookClient.send({
        content: "<@632252672338165801>",
        embeds: [embed],
      });
      return await msg.edit({
        embeds: [embedcomplete],
        files: [],
        components: [],
      });
    } else {
      try {
        //iterate through entries
        for (let index = 0; index < entries.length; index++) {
          //check each entry params are correct to enter
          //loop through entries array
          let entrant = entries[index].userid;
          //if wallet is needed check they have input one
          if (walletneeded != null) {
            let userinfo = await UserInfoCheck(entrant);
            if (walletneeded == "ETH") {
              if (userinfo == 0 || userinfo[0].ethwallet == null) {
                continue;
              } else {
              }
            }
            if (walletneeded == "SOL") {
              if (userinfo == 0 || userinfo[0].solwallet == null) {
                continue;
              }
            }
          }
          // check they have the role
          if (requiredrole != null) {
            let server = intclient.guilds.cache.get(serverid);
            try {
              const pullmember = await server.members.fetch(entrant);
              if (pullmember.roles.cache.has(requiredrole) == false) {
                console.log("no role");
                continue;
              }
            } catch (error) {
              if (error.code == 50007) {
                console.log("member not in server");
                continue;
              }
            }
          }
          //seriealise their information
          let usersinfo = await UserInfoCheck(entrant);
          if (usersinfo == 0) {
            continue;
          }
          const {
            access,
            secret,
            discordaccess,
            discordexpires,
            discordrefresh,
          } = usersinfo[0];

          if (serverneededid != null) {
            const checkeddiscord = await guildcheck(
              serverneededid,
              discordaccess
            );

            if (checkeddiscord == false) {
              continue;
            }
          }
          if (twitterid != null || tweettolike != null || tweettort != null) {
            //check they meet the twitter requirements
            const twitreqcheck = await twitreqscheck(intclient, access, secret);
            // console
            if (twitreqcheck != 1) {
              continue;
            }
          }
          successfulentries.push(entrant);
        }
        //pick x amount of winners from successfully entered array
        let winnersarr = pickRandomEntries(successfulentries, winneramount);
        // add role to all the winners
        winnersarr.forEach(async (winner) => {
          let server = await intclient.guilds.cache.get(serverid);
          const pullmember = await server.members.fetch(winner);
          pullmember.roles.add(winnerrole, `Won Giveaway - ${prize}`);
        });
        //edit message to have the winners @'d
        let winnersfields = [];
        async function formatWinners(winnersarr) {
          let winnersfields = [];
          let chunkSize = 10;

          for (let i = 0; i < winnersarr.length; i += chunkSize) {
            let chunk = winnersarr.slice(i, i + chunkSize);
            let value = "";
            for (let j = 0; j < chunk.length; j++) {
              const winnerobj = await intclient.guilds.cache
                .get(serverid)
                .members.fetch(chunk[j]);
              const username = `${winnerobj.user.username}#${winnerobj.user.discriminator}`;
              value += `${username}\n`;
            }
            let name = i === 0 ? "Winners" : "‏‏‎ ‎";
            let field = {
              name: name,
              value: value,
              inline: true,
            };
            winnersfields.push(field);
          }
          return winnersfields;
        }

        winnersfields = await formatWinners(winnersarr);
        try {
          let cryptowinners = [];
          for await (const winner of winnersarr) {
            const winnerobj = await intclient.guilds.cache
              .get(serverid)
              .members.fetch(winner);
            const username = `${winnerobj.user.username}#${winnerobj.user.discriminator}`;
            const uid = String(winnerobj.user.id);
            let userinfo = await UserInfoCheck(winner);
            let wallet =
              walletneeded == "ETH"
                ? userinfo[0].ethwallet
                : userinfo[0].solwallet;

            cryptowinners.push({ uid, username, wallet });
          }

          //make winners csv
          const csvstring = [
            ["Discord ID", "Username", "Wallet"],
            ...cryptowinners.map((item) => [
              item.uid,
              item.username,
              item.wallet,
            ]),
          ]
            .map((e) => e.join(","))
            .join("\n");
          const csvbuf = Buffer.from(csvstring);
          const csvattach = new AttachmentBuilder(csvbuf).setName(
            `winners_${prize}_${serverid}.csv`
          );
          //announce the winners
          let giveawayembed = new EmbedBuilder()
            .setColor("33FFAF")
            .setTitle(`Giveaway Ended!`)
            .addFields({
              name: "Prize",
              value: `\`\`\`yaml\n${prize}\n\`\`\``,
            })
            .addFields({
              name: "Successful Entrants",
              value: `\`\`\`yaml\n${successfulentries.length}\n\`\`\``,
            })
            .addFields(winnersfields)
            .setImage("attachment://giveawaybanner.jpg")
            .setFooter({
              text: "Brought to you by Mr Rolebot - @MrRolebot",
            });
          let embednowinners = new EmbedBuilder()
            .setColor("33FFAF")
            .setTitle("Giveaway Ended!")
            .setDescription(
              `There were no winners, as nobody successfully Entered!`
            )
            .addFields({
              name: "Prize",
              value: `\`\`\`yaml\n${prize}\n\`\`\``,
            })
            .setImage("attachment://giveawaybanner.jpg")
            .setFooter({
              text: "Brought to you by Mr Rolebot - @MrRolebot",
            });
          await GAUpdateDrawn(customid);
          // const nowinnershook = new EmbedBuilder()
          //   .setTitle("GA Results Drawn")
          //   .setColor("Red")
          //   .setDescription(
          //     `Giveaway winners drawn in ${servername} -[\`${serverid}\`] - [\`${customid}\`]\n\n**THERE WERE NO WINNERS RIP**`
          //   );
          // webhookClient.send({
          //   content: "<@632252672338165801>",
          //   embeds: [nowinnershook],
          // });
          const gabanner = new AttachmentBuilder(
            path.join(__dirname, "giveawaybanner.jpg")
          );

          const embed = new EmbedBuilder()
            .setTitle("GA Results Drawn")
            .setColor("#00FF00")
            .setDescription(
              `Giveaway winners drawn in ${servername} -[\`${serverid}\`] - [\`${customid}\`]\n\n`
            )
            .addFields({
              name: "Prize",
              value: `\`\`\`yaml\n${prize}\n\`\`\``,
            })
            .addFields({
              name: "Successful Entrants",
              value: `\`\`\`yaml\n${successfulentries.length}\n\`\`\``,
            })
            .addFields(winnersfields);
          webhookClient.send({
            content: "<@632252672338165801>",
            embeds: [embed],
          });
          const whichembed =
            successfulentries.length > 0 ? giveawayembed : embednowinners;
          //if wallet needed DM it to the creator
          if (walletneeded != null) {
            try {
              //add winner csv string to the DB
              const savedcsv = await GAAddorUpdateCSVs(customid, csvstring);
              let embeddm = new EmbedBuilder()
                .setTitle("Giveaway Ended!")
                .setColor("#33FFAF")
                .setDescription(
                  `Your giveaway has ended! View the winners [here](https://discord.com/channels/${serverid}/${channelid}/${messageid}) - As you had selected to collect ${walletneeded} wallets attached is a csv containing the winners wallets`
                )
                .setFooter({
                  text: "Brought to you by Mr Rolebot - @MrRolebot",
                });
              await intclient.users.send(createdby, {
                embeds: [embeddm],
                files: [csvattach],
              });
            } catch (error) {
              console.log(error.code);
              if (error.code == 50007) {
                console.log("can't dm them");
              }
            }
          }
          //
          function formatmention(winnersarr) {
            let mentionarr = [];
            for (let i = 0; i < winnersarr.length; i++) {
              mentionarr.push(`<@${winnersarr[i]}>`);
            }
            return mentionarr;
          }
          const mentionarr = formatmention(winnersarr);
          await channel.send({
            reply: { messageReference: messageid },
            content: `Congrats you won!\n\n${mentionarr}`,
          });
          return await msg.edit({
            embeds: [whichembed],
            components: [],
            files: [gabanner],
          });
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    if (error.code == 10008) {
      // await GAPanelDelete(customid);
      console.log(`deleted message no longer exists ${customid}`);
    } else {
      console.log(error);
    }
  }
  //DM winners and person who setup GA
}

module.exports = { EndGA };

// EndGA(null, "giveaway_714440739773480992_1069666157872820335");
