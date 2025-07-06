import { getMusicChannel } from '../database/db.js';

export default function registerMusicEvents(client) {
  client.on('trackStart', async ({ guildId, track }) => {
    try {
      const channelId = await getMusicChannel(guildId);
      if (!channelId) return;

      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) return;

      await channel.send(`🎶 Now Playing: **${track.info.title}**`);
    } catch (err) {
      console.error(`❌ Failed to send now playing message for guild ${guildId}:`, err);
    }
  });

  client.on('trackAdd', async ({ guildId, track }) => {
    try {
      const channelId = await getMusicChannel(guildId);
      if (!channelId) return;

      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) return;

      await channel.send(`➕ Queued: **${track.info.title}**`);
    } catch (err) {
      console.error(`❌ Failed to send queued message for guild ${guildId}:`, err);
    }
  });
}
