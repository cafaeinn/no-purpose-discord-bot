export default {
  name: 'purge',
  aliases: ['clear'],
  category: 'Moderation',
  description: 'Deletes a number of messages from a channel.',
  usage: 'purge <amount>',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageMessages')) {
      return message.reply('❌ You need the `Manage Messages` permission to use this command.');
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('❌ Please specify a number between 1 and 100.');
    }

    try {
      const messages = await message.channel.bulkDelete(amount, true);
      const users = [...new Set(messages.map(msg => msg.author).filter(u => !u.bot))];

      const userMentions = users.slice(0, 10).map(u => `• ${u}`).join('\n') || '*No user messages deleted.*';

      message.channel.send({
        embeds: [{
          title: '🧹 Messages Purged',
          description: `Deleted **${messages.size}** messages.\n\n**Users affected:**\n${userMentions}`,
          color: parseInt(
            (message.member.displayHexColor === '#000000' ? '#5865F2' : message.member.displayHexColor).replace('#', ''),
            16
          )
        }]
      }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 7000));
    } catch (err) {
      console.error(err);
      message.reply('❌ Failed to purge messages. Messages older than 14 days can’t be deleted.');
    }
  }
};
