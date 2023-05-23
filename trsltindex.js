const fs = require("node:fs");
const path = require("node:path");

//testpushERERRRR
const {
  ActivityType,
  Client,
  Collection,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  WebhookClient,
  AttachmentBuilder,
} = require("discord.js");
const deploycommands = require("./deploy-commands.js");
require("dotenv").config();

const webhook = process.env.BOTACTIVITY;
const info = webhook.split("/api/webhooks/");
const hookarr = info[1].split("/");
const webhookToken = hookarr[hookarr.length - 1];
const webhookId = hookarr[hookarr.length - 2];
const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    // GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.GuildMessageReactions,
    // GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

deploycommands();

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    // statcord.postCommand(command.data.name, interaction.user.id);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  } else if (interaction.isContextMenuCommand()) {
    const contextcommand = client.commands.get(interaction.commandName);

    try {
      await contextcommand.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  } else return;
});

client.login(process.env.BOTTOKEN);
client.once("ready", () => {
  console.log("Ready!");
  setInterval(function () {
    let servercount = client.guilds.cache.size;
    client.user.setActivity(`${servercount} Servers`, {
      type: ActivityType.Watching,
    });
  }, 20000);
});

function decimalToHex(decimal) {
  // Convert the decimal number to a string
  let hex = decimal.toString();

  // Add leading zeros if necessary
  hex = hex.padStart(8, "0");

  // Parse the string as an integer and convert it to a hexadecimal string
  hex = parseInt(hex).toString(16);

  return hex;
}

client.on("guildCreate", async (guild) => {
  const guildid = guild.id;
  const guildname = guild.name;
  const guildicon = guild.iconURL();
  const serverowner = guild.ownerId;
  const ownerobj = await client.users.fetch(serverowner);
  const ownerusername = `${ownerobj.username}#${ownerobj.discriminator}`;
  let membercount = 0;
  const serverscache = client.guilds.cache;
  serverscache.forEach((element) => {
    const memberamount = element.memberCount;
    membercount = membercount + memberamount;
  });
  const embedadded = new EmbedBuilder()
    .setTitle("Added to a Server")
    .setColor("#33FFAF")
    .setImage(guildicon)
    .setDescription(
      `I was added to a server!!\n\nServer - \`${guildname}\` [\`${guildid}\`]\nOwner - <@${serverowner}> [\`${ownerusername} - ${serverowner}\`]\n\nNew Total - Membercount - ${membercount}`
    );
  webhookClient.send({
    content: "<@632252672338165801>",
    embeds: [embedadded],
  });
});

client.on("guildDelete", async (guild) => {
  const guildid = guild.id;
  const guildname = guild.name;
  const guildicon = guild.iconURL();
  const serverowner = guild.ownerId;
  const ownerobj = await client.users.fetch(serverowner);
  const ownerusername = `${ownerobj.username}#${ownerobj.discriminator}`;
  let membercount = 0;
  const serverscache = client.guilds.cache;
  serverscache.forEach((element) => {
    const memberamount = element.memberCount;
    membercount = membercount + memberamount;
  });
  const embedremoved = new EmbedBuilder()
    .setTitle("Removed from Server")
    .setColor("ff0000")
    .setImage(guildicon)
    .setDescription(
      `I left a server!!\n\nServer - \`${guildname}\` [\`${guildid}\`]\nOwner - <@${serverowner}> [\`${ownerusername} - ${serverowner}\`]\n\nNew Total - Membercount - ${membercount}`
    );
  webhookClient.send({
    content: "<@632252672338165801>",
    embeds: [embedremoved],
  });
});
