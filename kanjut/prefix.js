import { configDb } from "../database/db.js";

export async function getPrefix(guildId) {
  const row = await configDb.get('SELECT prefix FROM prefixes WHERE guildId = ?', [guildId]);
  return row?.prefix || 'miku';
}
