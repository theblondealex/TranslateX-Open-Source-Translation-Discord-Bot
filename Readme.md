# TranslateX Discord Bot

Zero Permissions, Safe Translation Bot for your users! Allows your users to translate any message in the server into 20+ languages

Free and Open source however please leave credit in the embeds to myself TheBlondeAlex - [Discord]

## Prerequisites

- install [Node.js](https://nodejs.org/en/download/)
- create a [Discord Application](https://discord.com/developers/applications)
- create a [Discord Bot](https://discord.com/developers/applications)
- invite the bot to your server with the following permissions:
  - Read Message History
  - Read Messages/View Channels
- Add it to channels you need it to view and work in

- install the [Libretranslate](https://github.com/LibreTranslate/LibreTranslate) library on your server
- Follow the instructions on the Libretranslate page to get it running, and make sure it is running on port 5000

## Installation

1. Clone the repository:
2. create a .env file and add your bot token, application ID and a webhook URL (for logging)
3. run `npm install` to install dependencies
4. run `npm start` to start the bot

## Usage

### Context Menu

Right click on a message and select apps > Translate Message, this will translate the message into the users locale language with the option to choose another language

![context menu](/imgs/1.png)

The Bot will return an ephemeral message with the translation, and a button to change and choose another language

![context menu response](/imgs/2.png)

### Slash Commands

The bot has 2 slash commands, `/translate` and `/help`

`/translate` will translate the message into the users locale language with the option to choose another language

![slash command](/imgs/3.png)

![slash command modal](/imgs/4.png)

![slash command response](/imgs/5.png)

`/help` will return a list of commands and how to use them

![help command](/imgs/6.png)

### If you have any issues please open an issue on the github page, or contact me on discord TheBlondeAlex
