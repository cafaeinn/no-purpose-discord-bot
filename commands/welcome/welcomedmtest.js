import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { EmbedBuilder } from "discord.js";

function applyPlaceholders(str, member, guild) {
  return str
    .replace(/%user.mention%/g, `<@${member.id}>`)
    .replace(/%user.name%/g, member.user.username)
    .replace(/%user.tag%/g, member.user.tag)
    .replace(/%server.name%/g, guild.name)
    .replace(/%server.membercount%/g, guild.memberCount.toString())
    .replace(/%avatar%/g, member.displayAvatarURL({ dynamic: true }))
    .replace(/%servericon%/g, guild.iconURL({ dynamic: true }) || "");
}

export default {
  name: "welcomedmtest",
  aliases: ["wtestdm", "wdmtest"],
  category: "Welcome",
  description: "Sends the DM welcome message to you.",
  usage: "welcomedmtest [@user]",
  async execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("You need Administrator permission.");
    }

    const member = message.mentions.members.first() || message.member;

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

    if (!row?.dm_enabled) {
      return message.reply("DM welcome messages are not enabled.");
    }

    try {
      if (row.dm_embed) {
        const parsed = JSON.parse(applyPlaceholders(row.dm_embed, member, message.guild));
        const embed = EmbedBuilder.from(parsed);
        await member.send({ embeds: [embed] });
      } else if (row.dm_text) {
        const content = applyPlaceholders(row.dm_text, member, message.guild);
        await member.send(content);
      } else {
        return message.reply("No DM welcome message is currently set.");
      }
    } catch (e) {
      return message.reply("❌ Could not send DM message: " + e.message);
    }
  },
};
