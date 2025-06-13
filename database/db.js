// database/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.resolve(__dirname, './data');
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

// --- Moderation DB ---
export const modDb = await open({
  filename: path.join(dataPath, 'moderation.db'),
  driver: sqlite3.Database,
});

await modDb.exec(`
  CREATE TABLE IF NOT EXISTS tempbans (
    userId TEXT NOT NULL,
    guildId TEXT NOT NULL,
    unbanAt INTEGER NOT NULL,
    reason TEXT
  );
`);

await modDb.exec(`
  CREATE TABLE IF NOT EXISTS warnings (
    userId TEXT NOT NULL,
    guildId TEXT NOT NULL,
    moderator TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );
`);

// --- Config DB ---
export const configDb = await open({
  filename: path.join(dataPath, 'config.db'),
  driver: sqlite3.Database,
});

await configDb.exec(`
  CREATE TABLE IF NOT EXISTS prefixes (
    guildId TEXT PRIMARY KEY,
    prefix TEXT NOT NULL
  );
`);

await configDb.exec(`
  CREATE TABLE IF NOT EXISTS trace_channel (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL
  );
`);

await configDb.exec(`
  CREATE TABLE IF NOT EXISTS leave_config (
  guildId TEXT PRIMARY KEY,
  enabled INTEGER DEFAULT 0,
  channelId TEXT,
  message TEXT,
  embed TEXT,
  autodelete INTEGER DEFAULT 0
);
`);

export async function setLeaveSettings(guildId, { enabled, channelId, message, embed, autodelete }) {
  await configDb.run(`
    INSERT OR REPLACE INTO leave_config (guildId, enabled, channelId, message, embed, autodelete)
    VALUES (?, ?, ?, ?, ?, ?)
  `, guildId, enabled ? 1 : 0, channelId, message, embed, autodelete);
}

export async function getLeaveSettings(guildId) {
  return await configDb.get(`SELECT * FROM leave_config WHERE guildId = ?`, guildId);
}
