import { EmbedBuilder } from 'discord.js';

export default {
  name: 'userinfo',
  aliases: ['user', 'whois'],
  category: 'Info',
  description: 'Displays information about a user.',
  usage: 'userinfo [@user]',
  async execute(message, args) {
    const user =
      message.mentions.users.first() ||
      (args[0] && await message.client.users.fetch(args[0]).catch(() => null)) ||
      message.author;

    const member = message.guild.members.cache.get(user.id);
    const roles = member?.roles.cache
      .filter(role => role.id !== message.guild.id)
      .map(role => role.toString())
      .join(' ') || 'None';

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Info`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor(member?.displayHexColor || 'Blurple')
      .addFields(
        { name: 'Tag', value: user.tag, inline: true },
        { name: 'ID', value: user.id, inline: true },
        { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: 'Joined Server', value: member?.joinedAt?.toLocaleDateString() || 'N/A', inline: true },
        { name: 'Account Created', value: user.createdAt.toLocaleDateString(), inline: true },
        { name: 'Roles', value: roles, inline: false }
      )
      .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
