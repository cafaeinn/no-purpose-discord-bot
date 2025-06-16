import { EmbedBuilder } from 'discord.js';
import { configDb } from '../../database/db.js';

export default {
  name: 'leave',
  aliases: ['leavetoggle'],
  category: 'Leave',
  description: 'Toggles leave announcements in this channel.',
  usage: 'leave',
  async execute(message) {
    const guildId = message.guild.id;
    const channelId = message.channel.id;

    await configDb.run(`CREATE TABLE IF NOT EXISTS leave_config (
      guildId TEXT PRIMARY KEY,
      enabled INTEGER DEFAULT 0,
      channelId TEXT,
      message TEXT,
      embed TEXT,
      autodelete INTEGER DEFAULT 0
    )`);

    const existing = await configDb.get(`SELECT * FROM leave_config WHERE guildId = ?`, [guildId]);
    const newStatus = existing?.enabled ? 0 : 1;

    await configDb.run(
      `INSERT OR REPLACE INTO leave_config (guildId, enabled, channelId, message, embed, autodelete)
       VALUES (?, ?, ?, ?, ?, ?)`,
      guildId,
      newStatus,
      channelId,
      existing?.message || null,
      existing?.embed || null,
      existing?.autodelete || 0
    );

    const embed = new EmbedBuilder()
      .setTitle('👋 Leave System Updated')
      .setDescription(`Leave messages have been **${newStatus ? "enabled" : "disabled"}** in <#${channelId}>.`)
      .setColor(message.member?.displayHexColor || 0x00AE86)
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};
