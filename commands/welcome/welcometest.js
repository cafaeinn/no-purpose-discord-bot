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
  name: "welcometest",
  aliases: ["wtest", "wmsgtest"],
  category: "Welcome",
  description: "Sends the welcome message in this channel as if someone joined.",
  usage: "welcometest [@user]",
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

    const row = await db.get(
      `SELECT * FROM welcome_config WHERE guild_id = ?`,
      message.guild.id
    );

    if (!row || !row.enabled) {
      return message.reply("Welcome messages are not enabled.");
    }

    const guild = message.guild;

    if (row.message_embed) {
      try {
        const parsed = JSON.parse(applyPlaceholders(row.message_embed, member, guild));
        const embed = EmbedBuilder.from(parsed);
        const sent = await message.channel.send({ embeds: [embed] });

        if (row.auto_delete > 0) {
          setTimeout(() => sent.delete().catch(() => {}), row.auto_delete * 1000);
        }
      } catch (e) {
        return message.reply("❌ Failed to parse stored embed JSON.");
      }
    } else if (row.message_text) {
      const content = applyPlaceholders(row.message_text, member, guild);
      const sent = await message.channel.send(content);

      if (row.auto_delete > 0) {
        setTimeout(() => sent.delete().catch(() => {}), row.auto_delete * 1000);
      }
    } else {
      return message.reply("No welcome message is currently set.");
    }
  },
};
