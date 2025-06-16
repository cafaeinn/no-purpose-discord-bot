import { configDb } from '../../database/db.js';
import {
  EmbedBuilder
} from 'discord.js';

export default {
  name: 'setanimesearch',
  aliases: ['animeset', 'setanime'],
  category: 'Utility',
  description: 'Set channel for anime search',
  usage: 'setanimesearch <#channel>',
  async execute(message) {
    console.log('[DEBUG] Command triggered');

    if (!message.member.permissions.has('ManageGuild')) {
      return message.reply('❌ You need the **Manage Server** permission to use this command.');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('❌ Please mention a channel.');
    }

    console.log(`[DEBUG] Channel mentioned: ${channel.id}`);

    try {
      const row = await configDb.get(
        'SELECT channel_id FROM trace_channel WHERE guild_id = ?',
        [message.guild.id]
      );

      await configDb.run(
        `INSERT INTO trace_channel (guild_id, channel_id)
         VALUES (?, ?)
         ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id`,
        [message.guild.id, channel.id]
      );

      console.log('[DEBUG] Channel saved to DB');

      const updated = !!row;

      var emuotori = new EmbedBuilder()
      .setTitle(`✅ Anime search channel ${updated ? 'updated' : 'set'}`)
      .setDescription(`Anime search channel have been set to ${channel}`)
      .setColor(message.member?.displayHexColor || 0x00AE86)
      .setTimestamp();

      return message.channel.send({
        embeds: [
          emuotori
        ]
    });
    } catch (err) {
      console.error('[FATAL ERROR]', err);
      return message.reply('⚠️ An error occurred while saving the channel.');
    }
  }
};
