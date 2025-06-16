export default {
  name: 'kick',
  aliases: [],
  category: 'Moderation',
  description: 'Kicks a user from the server.',
  usage: 'kick <@user|userID> [reason]',
  async execute(message, args) {
    if (!message.member.permissions.has('KickMembers')) {
      return message.reply('❌ You don’t have permission to use this command.');
    }

    const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'No reason provided.';

    if (!user) {
      return message.reply('❌ Please mention a valid user or provide a valid user ID.');
    }

    if (!user.kickable) {
      return message.reply('❌ I cannot kick this user. Do they have a higher role?');
    }

    try {
      await user.kick(reason);
      return message.channel.send({
        embeds: [{
          title: '👢 User Kicked',
          description: `**${user.user.tag}** was kicked.\n**Reason:** ${reason}`,
          color: parseInt((user.displayHexColor === '#000000' ? '#ffcc00' : user.displayHexColor).replace('#', ''), 16),
          timestamp: new Date().toISOString(),
        }]
      });
    } catch (err) {
      console.error(err);
      return message.reply('❌ Failed to kick the user.');
    }
  }
};
