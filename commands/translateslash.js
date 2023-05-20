const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  AttachmentBuilder,
  WebhookClient,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  SelectMenuBuilder,
  ButtonStyle,
} = require("discord.js");

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const webhook = process.env.INVITEGENHOOK;
// const info = webhook.split("/api/webhooks/");
// const hookarr = info[1].split("/");
// const webhookToken = hookarr[hookarr.length - 1];
// const webhookId = hookarr[hookarr.length - 2];
// const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("translate-message")
    .setDescription(
      "helps you check your message and translate it into the servers language."
    )
    .addStringOption((option) =>
      option
        .setName("message-to-translate")
        .setDescription("what would you like to translate")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    //get the user data
    const comuserid = interaction.user.id;
    const comguild = interaction.member.guild.name;
    const comguildid = interaction.guildId;
    const intID = interaction.id;
    const comusername = `${interaction.user.username}#${interaction.user.discriminator}`;
    const msgtotrans = interaction.options.getString("message-to-translate");
    const guildlocale = interaction.guildLocale;
    // console.log(interaction);
    const guildcode = guildlocale.substring(0, 2);
    if (
      guildcode === "id" ||
      guildcode === "da" ||
      guildcode === "de" ||
      guildcode === "en" ||
      guildcode === "es" ||
      guildcode === "fr" ||
      guildcode === "it" ||
      guildcode === "nl" ||
      guildcode === "pl" ||
      guildcode === "pt" ||
      guildcode === "fi" ||
      guildcode === "sv" ||
      guildcode === "tr" ||
      guildcode === "cs" ||
      guildcode === "el" ||
      guildcode === "ru" ||
      guildcode === "uk" ||
      guildcode === "hi" ||
      guildcode === "zh" ||
      guildcode === "ja" ||
      guildcode === "ko"
    ) {
      try {
        const res = await fetch("http://127.0.0.1:5000/translate", {
          method: "POST",
          body: JSON.stringify({
            q: `${msgtotrans}`,
            source: "auto",
            target: `${guildcode}`,
            format: "text",
            api_key: "",
          }),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        const {
          translatedText: outputTxt,
          detectedLanguage: { confidence: score },
        } = data;
        const translatedembed = new EmbedBuilder()
          .setTitle("Translated to this servers language!")
          .setColor(3407791)
          .setDescription(
            `\`${outputTxt}\`\n\n||*Reliability Score ${score}%*||`
          );
        const langbutton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`lang_${comguildid}_${intID}`)
            .setLabel("Different Language")
            .setStyle(ButtonStyle.Success)
        );
        await interaction.editReply({
          content: ``,
          ephemeral: true,
          embeds: [translatedembed],
          components: [langbutton],
        });
        const confirmfilter = (i) =>
          i.customId === `lang_${comguildid}_${intID}`;

        // Initialize a collector to wait for a button click
        const collector = interaction.channel.createMessageComponentCollector({
          filter: confirmfilter,
          time: 15000,
        });
        collector.on("collect", async (interaction) => {
          await interaction.deferUpdate({ ephemeral: true });
          const format = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
              .setCustomId(`Select_lang_${intID}`)
              .setPlaceholder("Select a language")
              .addOptions(
                {
                  label: "Arabic",
                  description: "العربية",
                  value: "ar",
                },
                {
                  label: "Chinese",
                  description: "中文",
                  value: "zh",
                },
                {
                  label: "Czech",
                  description: "čeština",
                  value: "cs",
                },
                {
                  label: "Danish",
                  description: "dansk",
                  value: "da",
                },
                {
                  label: "Dutch",
                  description: "Nederlands",
                  value: "nl",
                },
                {
                  label: "English",
                  description: "English",
                  value: "en",
                },
                {
                  label: "Finnish",
                  description: "suomi",
                  value: "fi",
                },
                {
                  label: "French",
                  description: "français",
                  value: "fr",
                },
                {
                  label: "German",
                  description: "Deutsch",
                  value: "de",
                },
                {
                  label: "Greek",
                  description: "Ελληνικά",
                  value: "el",
                },
                {
                  label: "Hindi",
                  description: "हिन्दी",
                  value: "hi",
                },
                {
                  label: "Indonesian",
                  description: "Bahasa Indonesia",
                  value: "id",
                },
                {
                  label: "Italian",
                  description: "italiano",
                  value: "it",
                },
                {
                  label: "Japanese",
                  description: "日本語",
                  value: "ja",
                },
                {
                  label: "Korean",
                  description: "한국어",
                  value: "ko",
                },
                {
                  label: "Polish",
                  description: "polski",
                  value: "pl",
                },
                {
                  label: "Portuguese",
                  description: "Português",
                  value: "pt",
                },
                {
                  label: "Russian",
                  description: "Русский",
                  value: "ru",
                },
                {
                  label: "Spanish",
                  description: "Español",
                  value: "es",
                },
                {
                  label: "Swedish",
                  description: "svenska",
                  value: "sv",
                },
                {
                  label: "Turkish",
                  description: "Türkçe",
                  value: "tr",
                },
                {
                  label: "Ukrainian",
                  description: "українська",
                  value: "uk",
                }
              )
          );
          //check the format of the output
          await interaction.editReply({
            content: `Select your language to translate to`,
            ephemeral: true,
            embeds: [],
            components: [format],
          });
          const formatfilter = (i) => i.customId === `Select_lang_${intID}`;

          // Initialize a collector to wait for a select format click
          const formatcollector =
            interaction.channel.createMessageComponentCollector({
              filter: formatfilter,
              time: 15000,
            });
          //collect the format
          await formatcollector.on("collect", async (interaction) => {
            try {
              await interaction.deferUpdate({ ephemeral: true });
              const rawinfo = interaction.values;
              const res = await fetch("http://127.0.0.1:5000/translate", {
                method: "POST",
                body: JSON.stringify({
                  q: `${msgtotrans}`,
                  source: "auto",
                  target: `ar`,
                  format: "text",
                  api_key: "",
                }),
                headers: { "Content-Type": "application/json" },
              });
              const data = await res.json();
              const {
                translatedText: outputTxt,
                detectedLanguage: { confidence: score },
              } = data;
              const translatedembed = new EmbedBuilder()
                .setTitle("Translated!")
                .setColor(3407791)
                .setDescription(
                  `\`${outputTxt}\`\n\n||*Reliability Score ${score}%*||`
                );
              return interaction.editReply({
                content: ``,
                ephemeral: true,
                embeds: [translatedembed],
                components: [],
              });
            } catch (error) {
              console.log(error);
              console.log("failed lmao");
            }
          });
        });
      } catch (e) {
        console.log(e);
      }
    } else {
      //if no localization ask which language
      const format = new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId(`Select_lang_${intID}`)
          .setPlaceholder("Select a language")
          .addOptions(
            {
              label: "Arabic",
              description: "العربية",
              value: "ar",
            },
            {
              label: "Chinese",
              description: "中文",
              value: "zh",
            },
            {
              label: "Czech",
              description: "čeština",
              value: "cs",
            },
            {
              label: "Danish",
              description: "dansk",
              value: "da",
            },
            {
              label: "Dutch",
              description: "Nederlands",
              value: "nl",
            },
            {
              label: "English",
              description: "English",
              value: "en",
            },
            {
              label: "Finnish",
              description: "suomi",
              value: "fi",
            },
            {
              label: "French",
              description: "français",
              value: "fr",
            },
            {
              label: "German",
              description: "Deutsch",
              value: "de",
            },
            {
              label: "Greek",
              description: "Ελληνικά",
              value: "el",
            },
            {
              label: "Hindi",
              description: "हिन्दी",
              value: "hi",
            },
            {
              label: "Indonesian",
              description: "Bahasa Indonesia",
              value: "id",
            },
            {
              label: "Italian",
              description: "italiano",
              value: "it",
            },
            {
              label: "Japanese",
              description: "日本語",
              value: "ja",
            },
            {
              label: "Korean",
              description: "한국어",
              value: "ko",
            },
            {
              label: "Polish",
              description: "polski",
              value: "pl",
            },
            {
              label: "Portuguese",
              description: "Português",
              value: "pt",
            },
            {
              label: "Russian",
              description: "Русский",
              value: "ru",
            },
            {
              label: "Spanish",
              description: "Español",
              value: "es",
            },
            {
              label: "Swedish",
              description: "svenska",
              value: "sv",
            },
            {
              label: "Turkish",
              description: "Türkçe",
              value: "tr",
            },
            {
              label: "Ukrainian",
              description: "українська",
              value: "uk",
            }
          )
      );
      //check the format of the output
      await interaction.editReply({
        content: `Select your language to translate to`,
        ephemeral: true,
        components: [format],
      });
      const formatfilter = (i) => i.customId === `Select_lang_${intID}`;

      // Initialize a collector to wait for a select format click
      const formatcollector =
        interaction.channel.createMessageComponentCollector({
          filter: formatfilter,
          time: 15000,
        });
      //collect the format
      await formatcollector.on("collect", async (interaction) => {
        try {
          await interaction.deferUpdate({ ephemeral: true });
          const rawinfo = interaction.values;
          const res = await fetch("http://127.0.0.1:5000/translate", {
            method: "POST",
            body: JSON.stringify({
              q: `${msgtotrans}`,
              source: "auto",
              target: `ar`,
              format: "text",
              api_key: "",
            }),
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();
          const {
            translatedText: outputTxt,
            detectedLanguage: { confidence: score },
          } = data;
          const translatedembed = new EmbedBuilder()
            .setTitle("Translated!")
            .setColor(3407791)
            .setDescription(
              `\`${outputTxt}\`\n\n||*Reliability Score ${score}%*||`
            );
          return interaction.editReply({
            content: ``,
            ephemeral: true,
            embeds: [translatedembed],
            components: [],
          });
        } catch (error) {
          return interaction.editReply({
            content: `Failed to translate`,
            ephemeral: true,
            embeds: [],
            components: [],
          });
        }
      });
    }
  },
};
