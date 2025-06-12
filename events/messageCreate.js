import { getPrefix } from "../kanjut/prefix.js";

export default async (message, client) => {
  const prefix = await getPrefix(message.guild.id);
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('error ngabs');
  }
};
