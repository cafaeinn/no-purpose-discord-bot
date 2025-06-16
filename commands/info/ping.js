import { 
  EmbedBuilder 
} from 'discord.js';

export default {
  name: 'ping',
  aliases: ['p'],
  category: 'Info',
  description: 'Shows bot ping',
  usage: 'ping',
  async execute(message) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
        .setDescription(`Message Latency: ${message.createdTimestamp - message.createdTimestamp}ms\nAPI Latency: ${Math.round(message.client.ws.ping)}ms`)
        .setColor(message.member?.displayHexColor || 0x00AE86)
        .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp()
      ]
    });
  }
};
