import { EmbedBuilder } from 'discord.js';

export default {
  name: 'avatar',
  aliases: ['pfp', 'av'],
  category: 'Info',
  description: 'Shows user avatar',
  usage: 'avatar [@user]',
  async execute(message, args) {
    const user =
      message.mentions.users.first() ||
      (args[0] && await message.client.users.fetch(args[0]).catch(() => null)) ||
      message.author;

    const member = message.guild.members.cache.get(user.id);

    const embedColor = member?.displayHexColor === '#000000' ? null : member?.displayHexColor;

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 512, dynamic: true }))
      .setColor(embedColor || 'Blurple')
      .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
