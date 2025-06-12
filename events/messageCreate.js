import { getPrefix } from "../kanjut/prefix.js";
import animeSearch from '../tasks/animeSearch.js';

export default async (message, client) => {
  if (message.author.bot) return;

  await animeSearch(message);

  const prefix = await getPrefix(message.guild.id);
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('❌ Command error.');
  }
};
