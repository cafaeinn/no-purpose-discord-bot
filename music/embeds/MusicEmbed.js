import { EmbedBuilder } from 'discord.js';

export class MusicEmbed {
  constructor() {
    this.embed = new EmbedBuilder()
      .setColor('#00ffc8')
      .setTimestamp();
  }

  setTitle(title) {
    this.embed.setTitle(title);
    return this;
  }

  setDescription(text) {
    this.embed.setDescription(text);
    return this;
  }

  setThumbnail(url) {
    this.embed.setThumbnail(url);
    return this;
  }

  addField(name, value, inline = false) {
    this.embed.addFields({ name, value, inline });
    return this;
  }

  setFooter(text) {
    this.embed.setFooter({ text });
    return this;
  }

  build() {
    return this.embed;
  }
}
