import { parsePlaceholders } from './formatter.js';
import { getLeaveSettings } from '../database/db.js';

export async function handleLeave(member) {
  const settings = await getLeaveSettings(member.guild.id);
  if (!settings || !settings.enabled) return;

  const channel = member.guild.channels.cache.get(settings.channelId);
  if (!channel?.isTextBased?.()) return;

  const placeholders = {
    '%user.mention%': `<@${member.id}>`,
    '%user.tag%': member.user.tag,
    '%user.name%': member.user.username,
    '%server.name%': member.guild.name,
    '%server.membercount%': member.guild.memberCount.toString(),
    '%avatar%': member.displayAvatarURL({ dynamic: true }),
    '%servericon%': member.guild.iconURL({ dynamic: true }),
  };

  try {
    const content = parsePlaceholders(settings.message || `%user.tag% has left the server.`, placeholders);

    if (settings.embed) {
      const embedRaw = parsePlaceholders(settings.embed, placeholders);
      const embed = JSON.parse(embedRaw);

      if (typeof embed.image === 'string') embed.image = { url: embed.image };
      if (typeof embed.thumbnail === 'string') embed.thumbnail = { url: embed.thumbnail };

      await channel.send({ content, embeds: [embed] });
    } else {
      await channel.send(content);
    }
  } catch (error) {
    console.error('Failed to send leave message:', error);
  }
}
