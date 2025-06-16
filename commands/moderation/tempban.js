import ms from 'ms';
import { modDb } from '../../database/db.js';

export default {
  name: 'tempban',
  aliases: [],
  category: 'Moderation',
  description: 'Temporarily bans a user.',
  usage: 'tempban <@user|userID> <duration> [reason]',
  async execute(message, args) {
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply('❌ You don’t have permission to use this command.');
    }

    const userArg = args[0];
    const durationArg = args[1];
    const reason = args.slice(2).join(' ') || 'No reason provided.';

    if (!userArg || !durationArg) {
      return message.reply('❌ Usage: `tempban <@user|ID> <duration> [reason]`');
    }

    const msDuration = ms(durationArg);
    if (!msDuration) {
      return message.reply('❌ Invalid duration. Use something like `10m`, `1h`, `2d`.');
    }

    let user;
    try {
      user = message.mentions.members.first() ||
             message.guild.members.cache.get(userArg) ||
             await message.guild.members.fetch(userArg);
    } catch (e) {
      return message.reply('❌ Could not find that user.');
    }

    if (!user) return message.reply('❌ User not found.');
    if (user.id === message.author.id) return message.reply('❌ You cannot tempban yourself.');
    if (!user.bannable) return message.reply('❌ I cannot ban this user.');

    try {
      await user.ban({ reason });

      const unbanTime = Date.now() + msDuration;
      await modDb.run(`
        CREATE TABLE IF NOT EXISTS tempbans (
          userId TEXT NOT NULL,
          guildId TEXT NOT NULL,
          unbanAt INTEGER NOT NULL,
          reason TEXT
        );
      `);

      await modDb.run(
        'INSERT INTO tempbans (userId, guildId, unbanAt, reason) VALUES (?, ?, ?, ?)',
        [user.id, message.guild.id, unbanTime, reason]
      );

      return message.channel.send({
        embeds: [{
          title: '⏳ User Temporarily Banned',
          description: `**${user.user.tag}** was banned for **${durationArg}**.\n**Reason:** ${reason}`,
          color: parseInt((message.member.displayHexColor === '#000000' ? '#ffcc00' : message.member.displayHexColor).replace('#', ''), 16),
          timestamp: new Date().toISOString(),
        }]
      });
    } catch (err) {
      console.error(err);
      return message.reply('❌ Failed to tempban the user.');
    }
  }
};
