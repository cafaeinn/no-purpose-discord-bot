export default {
  name: 'ping',
  aliases: ['p'],
  category: 'Info',
  description: 'Shows bot ping',
  usage: 'ping',
  async execute(message) {
    await message.reply(`Message Latency: ${message.createdTimestamp - message.createdTimestamp}ms\nAPI Latency: ${Math.round(message.client.ws.ping)}ms`);
  }
};
