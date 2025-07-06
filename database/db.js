// database/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder exists
const dataPath = path.resolve(__dirname, './data');
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

/**
 * MODERATION DB
 */
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

/**
 * CONFIG DB
 */
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

/**
 * MUSIC DB
 */
export const db = await open({
  filename: path.join(dataPath, 'music.db'),
  driver: sqlite3.Database,
});

// Channels table (where to send music embeds)
await db.exec(`
  CREATE TABLE IF NOT EXISTS music_channels (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT
  );
`);

// Message tracking table (so embeds can be edited later)
await db.exec(`
  CREATE TABLE IF NOT EXISTS music_messages (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL
  );
`);

export async function setMusicChannel(guildId, channelId) {
  await db.run(
    `INSERT INTO music_channels (guild_id, channel_id)
     VALUES (?, ?)
     ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id`,
    guildId,
    channelId
  );
}

export async function getMusicChannel(guildId) {
  const row = await db.get(
    `SELECT channel_id FROM music_channels WHERE guild_id = ?`,
    guildId
  );
  return row?.channel_id || null;
}

export async function setNowPlayingMessage(guildId, channelId, messageId) {
  await db.run(
    `INSERT INTO music_messages (guild_id, channel_id, message_id)
     VALUES (?, ?, ?)
     ON CONFLICT(guild_id) DO UPDATE SET channel_id = ?, message_id = ?`,
    guildId, channelId, messageId, channelId, messageId
  );
}

export async function getNowPlayingMessage(guildId) {
  return await db.get(`SELECT * FROM music_messages WHERE guild_id = ?`, guildId);
}
