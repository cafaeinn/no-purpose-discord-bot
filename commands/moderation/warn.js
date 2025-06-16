// commands/moderation/warn.js
import { modDb } from '../../database/db.js';

export default {
  name: 'warn',
  aliases: [],
  category: 'Moderation',
  description: 'Warns a user, views warnings, or clears them.',
  usage: 'warn <@user|ID> [reason] | warn view <@user|ID> | warn clear <@user|ID>',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('❌ You don’t have permission to use moderation commands.');
    }

    const sub = args[0]?.toLowerCase();

    await modDb.exec(`
      CREATE TABLE IF NOT EXISTS warnings (
        userId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        moderator TEXT NOT NULL,
        reason TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
    `);

    // VIEW warnings
    if (sub === 'view') {
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[1] || args[0]);
      if (!target) return message.reply('❌ Specify a user to view warnings for.');

      const rows = await modDb.all(`
        SELECT * FROM warnings WHERE userId = ? AND guildId = ?
      `, target.id, message.guild.id);

      if (!rows.length) {
        return message.reply(`✅ **${target.user.tag}** has no warnings.`);
      }

      const warningList = rows
        .map((w, i) => `**${i + 1}.** \`${w.reason}\` — *${w.moderator}* (${new Date(w.timestamp).toLocaleString()})`)
        .join('\n');

      return message.channel.send({
        embeds: [{
          title: `⚠️ Warnings for ${target.user.tag}`,
          description: warningList,
          color: parseInt((target.displayHexColor === '#000000' ? '#ffcc00' : target.displayHexColor).replace('#', ''), 16),
          timestamp: new Date().toISOString()
        }]
      });
    }

    // CLEAR warnings
    if (sub === 'clear') {
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[1] || args[0]);
      if (!target) return message.reply('❌ Specify a user to clear warnings for.');

      const result = await modDb.run(`
        DELETE FROM warnings WHERE userId = ? AND guildId = ?
      `, target.id, message.guild.id);

      return message.reply(`🗑️ Cleared **${result.changes}** warning(s) for ${target.user.tag}.`);
    }

    // DEFAULT: Issue a warning
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      return message.reply('❌ Please mention a valid user or provide their ID.');
    }

    if (member.id === message.author.id) {
      return message.reply('❌ You cannot warn yourself.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided.';

    await modDb.run(`
      INSERT INTO warnings (userId, guildId, moderator, reason, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `, member.id, message.guild.id, message.author.tag, reason, new Date().toISOString());

    const count = await modDb.get(`
      SELECT COUNT(*) AS total FROM warnings
      WHERE userId = ? AND guildId = ?
    `, member.id, message.guild.id);

    return message.channel.send({
      embeds: [{
        title: '⚠️ Warning Issued',
        description: `**${member.user.tag}** has been warned.\n**Reason:** ${reason}\n**Total Warnings:** ${count.total}`,
        color: parseInt((member.displayHexColor === '#000000' ? '#ffcc00' : member.displayHexColor).replace('#', ''), 16)
      }]
    });
  }
};
