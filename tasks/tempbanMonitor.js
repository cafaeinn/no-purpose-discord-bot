import { modDb } from '../database/db.js';

export async function monitorTempbans(client) {
  setInterval(async () => {
    const now = Date.now();
    const expired = await modDb.all('SELECT * FROM tempbans WHERE unbanAt <= ?', now);

    for (const row of expired) {
      const guild = client.guilds.cache.get(row.guildId);
      if (!guild) continue;

      try {
        await guild.members.unban(row.userId, 'Temporary ban expired');
        await modDb.run('DELETE FROM tempbans WHERE userId = ? AND guildId = ?', [row.userId, row.guildId]);
        console.log(`✅ Unbanned ${row.userId} in ${guild.name}`);
      } catch (err) {
        console.error(`❌ Failed to unban ${row.userId}:`, err);
      }
    }
  }, 60_000);
}
