export default {
  name: 'ban',
  aliases: [],
  category: 'Moderation',
  description: 'Bans a user from the server by mention or ID.',
  usage: 'ban <@user|userID> [reason]',
  async execute(message, args) {
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply('❌ You don’t have permission to use this command.');
    }

    const userId = args[0]?.replace(/[<@!>]/g, '');
    const reason = args.slice(1).join(' ') || 'No reason provided.';

    if (!userId) {
      return message.reply('❌ Please mention a user or provide a valid user ID.');
    }

    // Prevent self-ban
    if (userId === message.author.id) {
      return message.reply('❌ You cannot ban yourself.');
    }

    try {
      const user = await message.client.users.fetch(userId).catch(() => null);
      if (!user) return message.reply('❌ Could not find the user.');

      // Optional: prevent banning the guild owner
      if (user.id === message.guild.ownerId) {
        return message.reply('❌ You cannot ban the server owner.');
      }

      // Check if user is in guild (cached)
      const member = message.guild.members.cache.get(user.id);

      // Check bannability if user is a guild member
      if (member && !member.bannable) {
        return message.reply('❌ I cannot ban this user. Do they have a higher role or special permissions?');
      }

      await message.guild.members.ban(user.id, { reason });

      return message.channel.send({
        embeds: [{
          title: '🔨 User Banned',
          description: `**${user.tag}** was banned.\n**Reason:** ${reason}`,
          color: parseInt((message.member.displayHexColor === '#000000' ? '#ff0000' : message.member.displayHexColor).replace('#', ''), 16),
        }]
      });
    } catch (err) {
      console.error(err);
      return message.reply('❌ Failed to ban the user.');
    }
  }
};
