import { Events } from 'discord.js';
import { getPrefix } from "../kanjut/prefix.js";
import animeSearch from '../tasks/animeSearch.js';

export default {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    await animeSearch(message);

    const prefix = await getPrefix(message.guild.id);
    const mentionPrefix = `<@${client.user.id}>`;
    const mentionPrefixAlt = `<@!${client.user.id}>`;

    const usedPrefix = [prefix, mentionPrefix, mentionPrefixAlt].find(p =>
      message.content.startsWith(p)
    );

    if (usedPrefix) {
      const args = message.content.slice(usedPrefix.length).trim().split(/\s+/);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;

      const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases?.includes(commandName));
      if (!command) return;

      try {
        // ✅ Fix the order here: (client, message, args)
        await command.execute(client, message, args);
      } catch (error) {
        console.error(`Error executing command '${commandName}':`, error);
        message.reply('❌ Command error.');
      }
    }
  }
};
