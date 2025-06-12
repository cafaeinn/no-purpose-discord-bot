export default {
  name: 'say',
  aliases: [],
  category: 'Utility',
  description: 'Say something using the bot',
  usage: 'say <string>',
  async execute(message, args) {
    await message.channel.send(args.join(' '));
    message.delete();
  }
};
