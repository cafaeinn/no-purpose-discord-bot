import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { EmbedBuilder } from "discord.js";

export default {
  name: "welcomedelete",
  aliases: ["weldelete", "weldel"],
  category: 'Welcome',
  description: "Sets the time in seconds to auto-delete welcome messages (0 to disable).",
  usage: "welcomedelete <seconds>",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("You need Administrator permission.");
    }

    const delay = parseInt(args[0]);
    if (isNaN(delay) || delay < 0) {
      return message.reply("Please provide a valid number (0 or greater).");
    }

    const db = await open({
      filename: "./database/data/config.db",
      driver: sqlite3.Database,
    });

    await db.run(`CREATE TABLE IF NOT EXISTS welcome_config (
      guild_id TEXT PRIMARY KEY,
      enabled INTEGER DEFAULT 0,
      channel_id TEXT,
      message_text TEXT,
      message_embed TEXT,
      auto_delete INTEGER DEFAULT 0,
      dm_enabled INTEGER DEFAULT 0,
      dm_text TEXT,
      dm_embed TEXT
    )`);

    const row = await db.get(
      `SELECT * FROM welcome_config WHERE guild_id = ?`,
      message.guild.id
    );

    await db.run(
      `INSERT OR REPLACE INTO welcome_config 
      (guild_id, enabled, channel_id, message_text, message_embed, auto_delete, dm_enabled, dm_text, dm_embed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      message.guild.id,
      row?.enabled || 0,
      row?.channel_id || message.channel.id,
      row?.message_text || null,
      row?.message_embed || null,
      delay,
      row?.dm_enabled || 0,
      row?.dm_text || null,
      row?.dm_embed || null
    );

    const embed = new EmbedBuilder()
      .setColor(message.member.displayHexColor || "#00AAFF")
      .setTitle("👋 Welcome Message Auto-Delete Updated")
      .setDescription(
        delay === 0
          ? "⏹️ Auto-deletion **disabled** for welcome messages."
          : `🕒 Welcome messages will now auto-delete after **${delay} seconds**.`
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
