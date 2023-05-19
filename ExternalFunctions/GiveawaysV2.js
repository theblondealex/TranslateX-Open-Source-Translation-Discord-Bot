const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  WebhookClient,
  ChannelType,
} = require("discord.js");
const axios = require("axios");
const { GAPanelAdd, EntriesPullGAbyID } = require("./DBCalls");

const { EndGA } = require("./GAEnded");

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const webhook = process.env.GAHOOK;
const info = webhook.split("/api/webhooks/");
const hookarr = info[1].split("/");
const webhookToken = hookarr[hookarr.length - 1];
const webhookId = hookarr[hookarr.length - 2];
const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaways2")
    .setDescription("Create, edit or delete a giveaway")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a Mr Rolebot Giveaway")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to send the giveaway to")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption((option) =>
          option
            .setName("ends")
            .setDescription("When should the giveaway end?")
            .setRequired(true)
            .addChoices(
              { name: "30d", value: "2592000000" },
              { name: "3d", value: "259200000" },
              { name: "24h", value: "86400000" },
              { name: "6h", value: "21600000" },
              { name: "3h", value: "10800000" },
              { name: "1h", value: "3600000" },
              { name: "15Mins", value: "900000" },
              { name: "5Min", value: "300000" },
              { name: "1Min", value: "60000" },
              { name: "30sec", value: "30000" }
            )
        )
        .addRoleOption((option) =>
          option
            .setName("role-required-to-enter")
            .setDescription("[OPTIONAL] a role members must have to enter")
        )
        .addRoleOption((option) =>
          option
            .setName("ignored-role")
            .setDescription(
              "[OPTIONAL] members with this role will not be allowed to enter the giveaway"
            )
        )
        .addAttachmentOption((option) =>
          option
            .setName("embed-image-or-gif")
            .setDescription(
              "[OPTIONAL MUST BE .PNG / .JPG / .gif / .Webp] use an online converter if it is not"
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("end")
        .setDescription("End a Mr Rolebot Giveaway")
        .addStringOption((option) =>
          option
            .setName("message-link")
            .setDescription(
              "A discord message link, linking to the giveaway message"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("collect-wallets")
        .setDescription("Collect the winning wallets of an ended giveaway")
        .addStringOption((option) =>
          option
            .setName("message-link")
            .setDescription(
              "A discord message link, linking to the giveaway message"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reroll")
        .setDescription("Reroll a Mr Rolebot Giveaway")
        .addStringOption((option) =>
          option
            .setName("message-link")
            .setDescription(
              "A discord message link, linking to the giveaway message"
            )
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const botid = interaction.client.user.id;
      const comuser = interaction.user;
      const comuserid = interaction.user.id;
      const comguild = interaction.member.guild.name;
      const comguildid = interaction.guildId;
      const comusername = `${interaction.user.username}#${interaction.user.discriminator}`;

      const icon = new AttachmentBuilder(
        path.join(__dirname, "theblondealexicon.png")
      );
      //check if bot has correct perms
      const botsrole = interaction.guild.members.me.roles.botRole;
      const botsroleperms = botsrole.permissions.serialize();
      if (
        botsroleperms.ReadMessageHistory == false ||
        botsroleperms.ManageRoles == false ||
        botsroleperms.ViewChannel == false ||
        botsroleperms.SendMessages == false
      ) {
        let embedinvalidperms = new EmbedBuilder()
          .setColor("ff0000")
          .setTitle("FAILED")
          .setDescription(
            `Invalid bot Role permissions, Please ensure that Mr Rolebot's Bot Role has\n\n> View Channel\n> Send Messages\n> Embed Links\n> AttachFiles\n> Read Message History\n> Manage Roles\n> Create Invites`
          )
          .setImage(
            "https://media.giphy.com/media/fdLR6LGwAiVNhGQNvf/giphy.gif"
          )
          .setFooter({
            text: "Brought to you by Mr Rolebot - @MrRolebot",
          });
        return await interaction.editReply({
          embeds: [embedinvalidperms],
          files: [],
        });
      }

      if (interaction.options.getSubcommand() === "create") {
        //get all the options as variable
        const channeltosend = interaction.options.getChannel("channel");
        const gachannel = channeltosend.id;
        const igrolereq = interaction.options.getRole("ignored-role");
        const embedimage =
          interaction.options.getAttachment("embed-image-or-gif");
        const rolereq = interaction.options.getRole("role-required-to-enter");
        const rolereqid = rolereq?.id;
        const igrolereqid = igrolereq?.id;
        let entriesno = 0;

        //check can do shit in the specified channel
        const channelinfo = channeltosend.permissionsFor(botid);
        const channelperms = channelinfo.serialize();
        if (
          channelperms.ViewChannel == false ||
          channelperms.SendMessages == false ||
          channelperms.EmbedLinks == false ||
          channelperms.AttachFiles == false ||
          channelperms.ReadMessageHistory == false
        ) {
          console.log("Bot channel perms", channelperms);
          const icon = new AttachmentBuilder("Buttons/theblondealexicon.png");
          let embedinvalidperms = new EmbedBuilder()
            .setColor("ff0000")
            .setTitle("FAILED")
            .setDescription(
              `Invalid bot permissions, Please ensure that Mr Rolebot can\n\n> View Channel\n> Send Messages\n> Embed Links\n> AttachFiles\n> Read Message History\n\nIn the Specified Channel (<#${channeltosend.id}>)`
            )
            .setImage(
              "https://media.giphy.com/media/fdLR6LGwAiVNhGQNvf/giphy.gif"
            )
            .setFooter({
              text: "Brought to you by Mr Rolebot - @MrRolebot",
            });
          return await interaction.editReply({
            embeds: [embedinvalidperms],
            files: [],
          });
        }
        //start a flow by functions
        //define a giveaway info object to update
        //send first reply with embed with details from the Command
      } else if (interaction.options.getSubcommand() === "collect-wallets") {
        //parse message id
        let messageurl = interaction.options.getString("message-link");

        const icon = new AttachmentBuilder("Buttons/theblondealexicon.png");
        const isValidUrl = (urlString) => {
          try {
            return Boolean(new URL(urlString));
          } catch (e) {
            return false;
          }
        };
        //check if its a real url
        if (isValidUrl(messageurl) == false) {
          let embedinvalidperms = new EmbedBuilder()
            .setColor("ff0000")
            .setTitle("FAILED")
            .setDescription(`The provided Message link is not a valid URL`)
            .setFooter({
              text: "Brought to you by Mr Rolebot - @MrRolebot",
            });
          return await interaction.editReply({
            embeds: [embedinvalidperms],
            files: [],
          });
        }

        const destructurl = messageurl.split("channels/");
        const destructdurlagain = destructurl[1].split("/");
        const server = destructdurlagain[0];
        const channelid = destructdurlagain[1];
        const messageid = destructdurlagain[2];
        //check it is from that server
        if (comguildid != server && comuserid != "632252672338165801") {
          let embedinvalidperms = new EmbedBuilder()
            .setColor("ff0000")
            .setTitle("FAILED")
            .setDescription(`The provided message link is not from this server`)
            .setFooter({
              text: "Brought to you by Mr Rolebot - @MrRolebot",
            });
          return await interaction.editReply({
            embeds: [embedinvalidperms],
            files: [],
          });
        }

        //check it is real message id
        try {
          //cache the message
          const gamessage = await interaction.guild.channels.cache
            .get(channelid)
            .messages.fetch(messageid);

          if (gamessage.author.id != botid) {
            let embedinvalidperms = new EmbedBuilder()
              .setColor("ff0000")
              .setTitle("FAILED")
              .setDescription(`Mr Rolebot did not send this message`)
              .setFooter({
                text: "Brought to you by Mr Rolebot - @MrRolebot",
              });
            return await interaction.editReply({
              embeds: [embedinvalidperms],
              files: [],
            });
          }
          //check it is in the DB
          const exists = await EntriesPullGAbyID(messageid);
          //check ga is in DB if not tell them its over 24hrs old its deleted
          if (exists == 0) {
            let embedinvalidperms = new EmbedBuilder()
              .setColor("ff0000")
              .setTitle("FAILED")
              .setDescription(
                `This giveaway is over 24hours old from when it was drawn, as such it has been removed from the database`
              )
              .setFooter({
                text: "Brought to you by Mr Rolebot - @MrRolebot",
              });
            return await interaction.editReply({
              embeds: [embedinvalidperms],
              files: [],
            });
          }
          //tell them it has not ended yet and to run end command if they want to end it
          if (exists[0].ended == false) {
            let embedinvalidperms = new EmbedBuilder()
              .setColor("ff0000")
              .setTitle("FAILED")
              .setDescription(
                `This giveaway has not ended yet! if you would like to end it early please run </giveaways-end:1068645255341146174>`
              )
              .setFooter({
                text: "Brought to you by Mr Rolebot - @MrRolebot",
              });
            return await interaction.editReply({
              embeds: [embedinvalidperms],
              files: [],
            });
          } else if (exists[0].ended == true) {
            //yay reroll the GA
            //pull the winners from the GA
            const csvbuf = Buffer.from(exists[0].winnerswalletscsv);
            const csvattach = new AttachmentBuilder(csvbuf).setName(
              `winners_${exists[0].prize}_${exists[0].serverid}.csv`
            );
            //format into a attactment and send it
            let embedcomplete = new EmbedBuilder()
              .setColor("33FFAF")
              .setTitle("Success!")
              .setDescription(
                `Wallets collected! - see attached for the winning wallets`
              )
              .setFooter({
                text: "Brought to you by Mr Rolebot - @MrRolebot",
              });
            return await interaction.editReply({
              embeds: [embedcomplete],
              ephemeral: true,
              files: [csvattach],
            });
          }
          //re run GAEnded
        } catch (error) {
          //check you can view the channel
          console.log(error, "ERROR GS9 ");
          if (error.code == 50001) {
            let embedinvalidperms = new EmbedBuilder()
              .setColor("ff0000")
              .setTitle("FAILED")
              .setDescription(
                `Mr Rolebot cannot see the linked messages's channel`
              )
              .setFooter({
                text: "Brought to you by Mr Rolebot - @MrRolebot",
              });
            return await interaction.editReply({
              embeds: [embedinvalidperms],
              files: [],
            });
          }

          let embedinvalidperms = new EmbedBuilder()
            .setColor("ff0000")
            .setTitle("FAILED")
            .setDescription(
              `The provided Message link is not valid a message URL, that Mr Rolebot can access`
            )
            .setFooter({
              text: "Brought to you by Mr Rolebot - @MrRolebot",
            });
          return await interaction.editReply({
            embeds: [embedinvalidperms],
            files: [],
          });
        }
      } else if (interaction.options.getSubcommand() === "end") {
        //pull ga data
        //run run GAEnded
        //update DB entry to drawn so it does not get drawn at entry time
        //parse message id
        let messageurl = interaction.options.getString("message-link");

        const icon = new AttachmentBuilder("Buttons/theblondealexicon.png");
        const isValidUrl = (urlString) => {
          try {
            return Boolean(new URL(urlString));
          } catch (e) {
            return false;
          }
        };
        //check if its a real url
        if (isValidUrl(messageurl) == false) {
          let embedinvalidperms = new EmbedBuilder()
            .setColor("ff0000")
            .setTitle("FAILED")
            .setDescription(`The provided Message link is not a valid URL`)
            .setFooter({
              text: "Brought to you by Mr Rolebot - @MrRolebot",
            });
          return await interaction.editReply({
            embeds: [embedinvalidperms],
            files: [],
          });
        }

        const destructurl = messageurl.split("channels/");
        const destructdurlagain = destructurl[1].split("/");
        const server = destructdurlagain[0];
        const channelid = destructdurlagain[1];
        const messageid = destructdurlagain[2];
        //check it is from that server
        if (comguildid != server && comuserid != "632252672338165801") {
          let embedinvalidperms = new EmbedBuilder()
            .setColor("ff0000")
            .setTitle("FAILED")
            .setDescription(`The provided Message link is not from this server`)
            .setFooter({
              text: "Brought to you by Mr Rolebot - @MrRolebot",
            });
          return await interaction.editReply({
            embeds: [embedinvalidperms],
            files: [],
          });
        }

        //check it is real message id
        try {
          // cache the server
          const servercached = await interaction.client.guilds.cache.get(
            server
          );
          //cache the message
          const gamessagech = await servercached.channels.cache.get(channelid);
          const gamessage = await gamessagech.messages.fetch(messageid);
          if (gamessage.author.id != botid) {
            let embedinvalidperms = new EmbedBuilder()
              .setColor("ff0000")
              .setTitle("FAILED")
              .setDescription(`Mr Rolebot did not send this message`)
              .setFooter({
                text: "Brought to you by Mr Rolebot - @MrRolebot",
              });
            return await interaction.editReply({
              embeds: [embedinvalidperms],
              files: [],
            });
          }
          //check it is in the DB
          const exists = await EntriesPullGAbyID(messageid);
          //check ga is in DB if not tell them its over 24hrs old its deleted
          if (exists == 0) {
            let embedinvalidperms = new EmbedBuilder()
              .setColor("ff0000")
              .setTitle("FAILED")
              .setDescription(
                `This giveaway is over 24hours old from when it was drawn, as such it has been removed from the database`
              )
              .setFooter({
                text: "Brought to you by Mr Rolebot - @MrRolebot",
              });
            return await interaction.editReply({
              embeds: [embedinvalidperms],
              files: [],
            });
          }
          //tell them it has not ended yet and to run end command if they want to end it
          //yay end the GA
          await EndGA(interaction.client, `${exists[0].customid}`);
          let embedcomplete = new EmbedBuilder()
            .setColor("33FFAF")
            .setTitle("Success!")
            .setDescription(`Ended Giveaway!`)
            .setFooter({
              text: "Brought to you by Mr Rolebot - @MrRolebot",
            });
          return await interaction.editReply({
            embeds: [embedcomplete],
            files: [],
          });

          //re run GAEnded
        } catch (error) {
          //check you can view the channel
          console.log(error, "ERROR GS10");
          if (error.code == 50001) {
            let embedinvalidperms = new EmbedBuilder()
              .setColor("ff0000")
              .setTitle("FAILED")
              .setDescription(
                `Mr Rolebot cannot see the linked messages's channel`
              )
              .setFooter({
                text: "Brought to you by Mr Rolebot - @MrRolebot",
              });
            return await interaction.editReply({
              embeds: [embedinvalidperms],
              files: [],
            });
          }
        }
      }
    } catch (error) {
      console.log("ERROR GS FULL", error);
    }
  },
};

//store data in DB
