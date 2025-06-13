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
  name: "leavetest",
  aliases: ["ltest"],
  category: "Leave",
  description: "Sends the leave message as if someone left.",
  usage: "leavetest [@user]",
  async execute(message, args) {
    const member = message.mentions.members.first() || message.member;

    const db = await open({
      filename: "./database/data/config.db",
      driver: sqlite3.Database,
    });

    const row = await db.get(`SELECT * FROM leave_config WHERE guildId = ?`, message.guild.id);
    if (!row || !row.enabled) {
      return message.reply("Leave messages are not enabled.");
    }

    if (row.embed) {
      try {
        const json = JSON.parse(applyPlaceholders(row.embed, member, message.guild));
        const embed = EmbedBuilder.from(json);
        return message.channel.send({ embeds: [embed] });
      } catch {
        return message.reply("❌ Failed to parse stored embed JSON.");
      }
    } else if (row.message) {
      const content = applyPlaceholders(row.message, member, message.guild);
      return message.channel.send(content);
    } else {
      return message.reply("No leave message is currently set.");
    }
  },
};
