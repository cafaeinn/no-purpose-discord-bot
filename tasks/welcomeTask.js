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

export default async function handleWelcome(member) {
  const db = await open({
    filename: "./database/data/config.db",
    driver: sqlite3.Database,
  });

  const row = await db.get(
    `SELECT * FROM welcome_config WHERE guild_id = ?`,
    member.guild.id
  );

  if (!row || !row.enabled) return;

  const guild = member.guild;
  const channel = guild.channels.cache.get(row.channel_id);

  // === Server message ===
  if (channel?.isTextBased()) {
    try {
      let msg;
      if (row.message_embed) {
        const parsed = JSON.parse(applyPlaceholders(row.message_embed, member, guild));
        const embed = EmbedBuilder.from(parsed);
        msg = await channel.send({ embeds: [embed] });
      } else if (row.message_text) {
        const content = applyPlaceholders(row.message_text, member, guild);
        msg = await channel.send(content);
      }

      if (msg && row.auto_delete > 0) {
        setTimeout(() => msg.delete().catch(() => {}), row.auto_delete * 1000);
      }
    } catch (e) {
      console.error("Failed to send welcome message:", e.message);
    }
  }

  // === DM message ===
  if (row.dm_enabled) {
    try {
      if (row.dm_embed) {
        const parsed = JSON.parse(applyPlaceholders(row.dm_embed, member, guild));
        const embed = EmbedBuilder.from(parsed);
        await member.send({ embeds: [embed] });
      } else if (row.dm_text) {
        const content = applyPlaceholders(row.dm_text, member, guild);
        await member.send(content);
      }
    } catch (e) {
      console.warn(`Could not DM ${member.user.tag}:`, e.message);
    }
  }
}
