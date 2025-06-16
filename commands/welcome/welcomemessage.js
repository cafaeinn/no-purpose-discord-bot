import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { EmbedBuilder } from "discord.js";

export default {
  name: "welcomemessage",
  aliases: ["welmsg", "wm"],
  category: "Welcome",
  description: "Sets or shows the welcome message for this server.",
  usage: "welcomemessage <text or embed JSON>",
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

    const existing = await db.get(`SELECT * FROM welcome_config WHERE guild_id = ?`, message.guild.id);

    if (!args.length) {
      const current = existing?.message_embed
        ? `📦 **Embed Message:**\n\`\`\`json\n${existing.message_embed}\n\`\`\``
        : existing?.message_text
        ? `📝 **Text Message:**\n${existing.message_text}`
        : "No welcome message is currently set.";

      const embed = new EmbedBuilder()
        .setColor(message.member.displayHexColor || "#00AAFF")
        .setTitle("Current Welcome Message")
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
      existing?.enabled || 1,
      message.channel.id,
      text,
      embedData,
      existing?.auto_delete || 0,
      existing?.dm_enabled || 0,
      existing?.dm_text || null,
      existing?.dm_embed || null
    );

    const success = new EmbedBuilder()
      .setColor(message.member.displayHexColor || "#00AAFF")
      .setTitle("👋 Welcome Message Updated")
      .setDescription(embedData ? "✅ Embed welcome message set." : "✅ Text message set.")
      .setTimestamp();

    message.reply({ embeds: [success] });
  },
};
