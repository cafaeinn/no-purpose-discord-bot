// database/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dataPath = path.resolve(__dirname, './data');
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

//mod

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

//config

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