import { MusicEmbed } from './MusicEmbed.js';

export class ErrorEmbed extends MusicEmbed {
  constructor(message) {
    super();
    this.message = message;
  }

  buildEmbed() {
    this.setTitle('❌ Error')
      .setDescription(`\`\`\`\n${this.message}\n\`\`\``)
      .setColor('#ff4d4d');
    return this.build();
  }
}
