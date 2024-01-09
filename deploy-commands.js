const fs = require("node:fs");
const path = require("node:path");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
require("dotenv").config();

module.exports = async function deploycommands() {
  const commands = [];
  const testcommands = [];
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(process.env.BOTTOKEN);
  rest
    .put(Routes.applicationCommands(process.env.CLIENTID), {
      body: commands,
    })
    .then(() => console.log(`Successfully registered Global commands.`));
};
