import { configDb } from "../../database/db.js";
import { getPrefix } from "../../kanjut/prefix.js";

export default {
  name: 'prefix',
  aliases: [],
  category: 'Utility',
  description: 'Shows or change prefix',
  usage: 'prefix || prefix [newPrefix]',
  async execute(message, args) {
    const guildId = message.guild?.id;
    if (!guildId) return message.reply('❌ This command can only be used in a server.');

    const current = await getPrefix(guildId);

    if (!args[0]) {
      return message.channel.send({
        embeds: [{
          title: '📌 Current Prefix',
          description: `The current prefix is \`${current}\``,
          color: parseInt(
            (message.member.displayHexColor === '#000000' ? '#5865F2' : message.member.displayHexColor).replace('#', ''),
            16
          ),
          timestamp: new Date().toISOString()
        }]
      });
    }

    if (!message.member.permissions.has('ManageGuild')) {
      return message.reply('❌ You need the `Manage Server` permission to change the prefix.');
    }

    const newPrefix = args[0];

    if (newPrefix.length > 5) {
      return message.reply('❌ Prefix too long. Keep it under 5 characters.');
    }

    await configDb.run(`
      INSERT INTO prefixes (guildId, prefix) VALUES (?, ?)
      ON CONFLICT(guildId) DO UPDATE SET prefix = excluded.prefix
    `, guildId, newPrefix);

    message.channel.send({
      embeds: [{
        title: '✅ Prefix Updated',
        description: `New prefix set to \`${newPrefix}\``,
        color: parseInt(
          (message.member.displayHexColor === '#000000' ? '#43B581' : message.member.displayHexColor).replace('#', ''),
          16
        ),
        timestamp: new Date().toISOString()
      }]
    });
  }
};
