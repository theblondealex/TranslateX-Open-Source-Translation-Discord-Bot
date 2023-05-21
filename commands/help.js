const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  WebhookClient,
  AttachmentBuilder,
} = require("discord.js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const webhook = process.env.HELPHOOK;
const info = webhook.split("/api/webhooks/");
const hookarr = info[1].split("/");
const webhookToken = hookarr[hookarr.length - 1];
const webhookId = hookarr[hookarr.length - 2];
const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

const icon = new AttachmentBuilder("Buttons/theblondealexicon.png");

const helpembed = {
  title: "TranslateX Command Guide!",
  description:
    "This is a very simple bot.\n\nPermissions required\n> Read/view in any channel you'd like it available in",
  url: "https://discord.gg/zjjgtUywH3",
  color: 13356495,
  fields: [
    {
      name: "Translate Slash command",
      value:
        "</translate-message:1109477534267097098> - Allows memebers to see a modal, send text for it to translate, check your translations before sending in a server and chatting to other nationalities",
    },
    {
      name: "Translate context command",
      value:
        "*Translate Any message*\n> Right click a message\n>  Click Apps > Translate Message\n\nIf the commands do not appear  talk to your server admins to ensure the commands are enabled or join the support server.",
    },
    {
      name: "click the title for the support server",
    },
  ],
  footer: {
    text: "Developed by @TheBlondeAlex - Alexander.#0001",
    icon_url:
      "https://cdn.discordapp.com/attachments/714981224275509258/1109872792431759450/dsadsa.png",
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("gives all translatex commands and info"),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
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
    return interaction.editReply({
      embeds: [helpembed],
      files: [],
    });
  },
};
