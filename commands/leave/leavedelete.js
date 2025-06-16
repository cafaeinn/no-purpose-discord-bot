import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
  name: "leavedelete",
  aliases: ["leavedel"],
  category: "Leave",
  description: "Sets the auto-delete time for leave messages (0 to disable).",
  usage: "leavedelete <seconds>",
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
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

    await db.run(`CREATE TABLE IF NOT EXISTS leave_config (
      guildId TEXT PRIMARY KEY,
      enabled INTEGER DEFAULT 0,
      channelId TEXT,
      message TEXT,
      embed TEXT,
      autodelete INTEGER DEFAULT 0
    )`);

    const row = await db.get(`SELECT * FROM leave_config WHERE guildId = ?`, message.guild.id);

    await db.run(
      `INSERT OR REPLACE INTO leave_config 
      (guildId, enabled, channelId, message, embed, autodelete)
      VALUES (?, ?, ?, ?, ?, ?)`,
      message.guild.id,
      row?.enabled || 0,
      row?.channelId || message.channel.id,
      row?.message || null,
      row?.embed || null,
      delay
    );

    const embed = new EmbedBuilder()
      .setColor(message.member.displayHexColor || "#FF5555")
      .setTitle("👋 Leave Message Auto-Delete Updated")
      .setDescription(
        delay === 0
          ? "⏹️ Auto-deletion **disabled** for leave messages."
          : `🕒 Leave messages will now auto-delete after **${delay} seconds**.`
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
