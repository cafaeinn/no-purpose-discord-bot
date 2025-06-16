import { EmbedBuilder } from 'discord.js';
import { Vibrant } from 'node-vibrant/node';

export default {
  name: 'serverinfo',
  aliases: ['server', 'guild'],
  category: 'Info',
  description: 'Displays information about the server.',
  usage: 'serverinfo',
  async execute(message) {
    const { guild } = message;
    const iconURL = guild.iconURL({ size: 256, extension: 'png' });

    // node-vibrant bosquuu
    let dominantHex = '#5865F2'; // Default Discord blurple
    if (iconURL) {
      try {
        const palette = await Vibrant.from(iconURL).getPalette();
        dominantHex = palette?.Vibrant?.hex || dominantHex;
      } catch (err) {
        console.warn('Failed to extract color from server icon:', err);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${guild.name} Info`)
      .setThumbnail(iconURL)
      .setColor(dominantHex)
      .addFields(
        { name: 'Name', value: guild.name, inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true }
      )
      .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
