import ms from 'ms';

export default {
  name: 'timeout',
  aliases: ['mute', 'to'],
  category: 'Moderation',
  description: 'Temporarily times out a user (prevents messaging, speaking, reacting).',
  usage: 'timeout <@user|ID> <duration> [reason]',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('❌ You don’t have permission to timeout members.');
    }
    const rawTarget = args[0];
    const member =
    message.mentions.members.first() ||
    message.guild.members.cache.get(rawTarget) ||
    (await message.guild.members.fetch(rawTarget).catch(() => null));
    const duration = args[1];
    if (!duration || !ms(duration)) {
        return message.reply('❌ Invalid or missing duration. Use something like `10m`, `2h`, `1d`.');
    }   
    const msDuration = ms(duration);
    const reason = args.slice(2).join(' ') || 'No reason provided.';

    if (!member || !msDuration || msDuration > 28 * 24 * 60 * 60 * 1000) {
      return message.reply('❌ Usage: `tempmute <@user|ID> <duration> [reason]`\n⏳ Max timeout: 28 days.');
    }

    if (!member.moderatable) {
      return message.reply('❌ I can’t timeout that user (check role hierarchy).');
    }

    try {
      await member.timeout(msDuration, reason);
      return message.channel.send({
        embeds: [{
          title: '🔇 User Timed Out',
          description: `**${member.user.tag}** has been timed out for **${duration}**.\n**Reason:** ${reason}`,
          color: parseInt((member.displayHexColor === '#000000' ? '#ffcc00' : member.displayHexColor).replace('#', ''), 16),
          timestamp: new Date().toISOString()
        }]
      });
    } catch (err) {
      console.error(err);
      return message.reply('❌ Failed to timeout the user.');
    }
  }
};
