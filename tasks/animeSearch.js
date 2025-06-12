import { configDb } from '../database/db.js';
import fetch from 'node-fetch';

export default async function animeSearch(message) {
  if (message.author.bot || !message.guild) return;

  console.log('[animeSearch] Message detected:', message.content);

  configDb.get(
    `SELECT channel_id FROM trace_channel WHERE guild_id = ?`,
    [message.guild.id],
    async (err, row) => {
      if (err) return console.error('[animeSearch] DB error:', err);
      if (!row || message.channel.id !== row.channel_id) return;

      // Attachment image URL
      const attachment = message.attachments.find(att =>
        att.url?.match(/\.(png|jpe?g|webp)(\?.*)?$/i)
      );
      const attachmentUrl = attachment?.url;

      // Message content image URL
      const contentUrl = message.content.match(/https?:\/\/[^\s]+?\.(png|jpe?g|webp)(\?.*)?/i)?.[0];

      const imageUrl = attachmentUrl || contentUrl;
      console.log('[animeSearch] Detected image URL:', imageUrl);

      if (!imageUrl) return;

      try {
        await message.channel.sendTyping();

        const apiUrl = `https://api.trace.moe/search?anilistInfo&url=${encodeURIComponent(imageUrl)}`;
        console.log('[animeSearch] Fetching:', apiUrl);

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.result?.length) {
          return message.reply('❌ No anime match found.');
        }

        const result = data.result[0];
        const info = result.anilist;

        const embed = {
          title: info.title.romaji || info.title.english || 'Unknown',
          url: result.video,
          description: [
            `**Episode:** ${result.episode ?? 'Unknown'}`,
            `**Similarity:** ${(result.similarity * 100).toFixed(2)}%`,
            `**Format:** ${info.format ?? 'N/A'}`,
            `**Genres:** ${info.genres?.join(', ') || 'N/A'}`
          ].join('\n'),
          image: { url: result.image },
          footer: { text: 'Powered by trace.moe' },
          color: 0x7289da
        };

        await message.reply({ embeds: [embed] });
      } catch (err) {
        console.error('[animeSearch] API error:', err);
        message.reply('⚠️ Error identifying the anime.');
      }
    }
  );
}
