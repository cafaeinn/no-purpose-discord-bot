import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { EmbedBuilder } from "discord.js";

export default {
  name: "welcomedmmessage",
  aliases: ["weldmmsg", "wdm"],
  category: "Welcome",
  description: "Sets or shows the DM welcome message.",
  usage: "welcomedmmessage <text or embed JSON>",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("You need Administrator permission.");
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

    const row = await db.get(`SELECT * FROM welcome_config WHERE guild_id = ?`, message.guild.id);

    if (!args.length) {
      const current = row?.dm_embed
        ? `📦 **Embed DM:**\n\`\`\`json\n${row.dm_embed}\n\`\`\``
        : row?.dm_text
        ? `📝 **Text DM:**\n${row.dm_text}`
        : "No DM message is currently set.";

      const embed = new EmbedBuilder()
        .setColor(message.member.displayHexColor || "#00AAFF")
        .setTitle("Current DM Welcome Message")
        .setDescription(current);

      return message.reply({ embeds: [embed] });
    }

    let text = args.join(" ");
    let embedData = null;

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === "object" && parsed !== null) {
        embedData = text;
        text = null;
      }
    } catch (e) {}

    await db.run(
      `INSERT OR REPLACE INTO welcome_config
      (guild_id, enabled, channel_id, message_text, message_embed, auto_delete, dm_enabled, dm_text, dm_embed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      message.guild.id,
      row?.enabled || 1,
      row?.channel_id || message.channel.id,
      row?.message_text || null,
      row?.message_embed || null,
      row?.auto_delete || 0,
      1,
      text,
      embedData
    );

    const success = new EmbedBuilder()
      .setColor(message.member.displayHexColor || "#00AAFF")
      .setTitle("👋 DM Welcome Message Updated")
      .setDescription(embedData ? "✅ Embed DM message set." : "✅ Text DM message set.")
      .setTimestamp();

    message.reply({ embeds: [success] });
  },
};
