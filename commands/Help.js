const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  WebhookClient,
  AttachmentBuilder,
} = require("discord.js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
// const webhook = process.env.HELPHOOK;
// const info = webhook.split("/api/webhooks/");
// const hookarr = info[1].split("/");
// const webhookToken = hookarr[hookarr.length - 1];
// const webhookId = hookarr[hookarr.length - 2];
// const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

const icon = new AttachmentBuilder("Buttons/theblondealexicon.png");

const helpembed = {
  title: "Mr Rolebot",
  description: "A range of features catered to making your life easier",
  color: 3407791,
  fields: [
    {
      name: "Guide",
      value:
        "To read all about Mr Rolebot read the guide [HERE](https://docs.mrrolebot.com/)",
    },
    {
      name: "For any other error please ask in the Mr Rolebot discord",
      value: "[Here](https://discord.gg/DwyUnR43u3)",
    },
  ],
  footer: {
    text: "Brought to you by Mr Rolebot - @MrRolebot",
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("gives all rolebot commands and info"),
  async execute(interaction) {
    const comuserid = interaction.user.id;
    const comguild =
      interaction?.member?.guild.name != null
        ? interaction.member.guild.name
        : "DM's";
    const comguildid =
      interaction?.guildId != null ? interaction.guildId : "DM's";
    const comusername = `${interaction.user.username}#${interaction.user.discriminator}`;
    const embed = new EmbedBuilder()
      .setTitle("Help Ran")
      .setColor(3407791)
      .setDescription(
        `<@${comuserid}> [${comusername}] ran the help command in ${comguild}\n\n${comuserid} ran the command in ${comguildid}`
      );
    webhookClient.send({
      content: "<@632252672338165801>",
      embeds: [embed],
    });
    return interaction.reply({
      embeds: [helpembed],
      files: [],
    });
  },
};
