import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
  name: "leavemessage",
  aliases: ["leavemsg", "lm"],
  category: "Leave",
  description: "Sets or shows the leave message for this server.",
  usage: "leavemessage <text or embed JSON>",
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You need Administrator permission.");
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

    const existing = await db.get(`SELECT * FROM leave_config WHERE guildId = ?`, message.guild.id);

    if (!args.length) {
      const display = existing?.embed
        ? `📦 **Embed Message:**\n\`\`\`json\n${existing.embed}\n\`\`\``
        : existing?.message
        ? `📝 **Text Message:**\n${existing.message}`
        : "No leave message is currently set.";

      const embed = new EmbedBuilder()
        .setColor(message.member.displayHexColor || "#FF5555")
        .setTitle("Current Leave Message")
        .setDescription(display);

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
      `INSERT OR REPLACE INTO leave_config 
      (guildId, enabled, channelId, message, embed, autodelete)
      VALUES (?, ?, ?, ?, ?, ?)`,
      message.guild.id,
      existing?.enabled || 1,
      message.channel.id,
      text,
      embedData,
      existing?.autodelete || 0
    );

    const success = new EmbedBuilder()
      .setColor(message.member.displayHexColor || "#FF5555")
      .setTitle("👋 Leave Message Updated")
      .setDescription(embedData ? "✅ Embed message set." : "✅ Text message set.")
      .setTimestamp();

    return message.reply({ embeds: [success] });
  },
};
