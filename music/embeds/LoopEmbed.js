import { MusicEmbed } from './MusicEmbed.js';

export class LoopEmbed extends MusicEmbed {
  constructor(enabled) {
    super();
    this.enabled = enabled;
  }

  buildEmbed() {
    this.setTitle('🔁 Loop Status')
      .setDescription(`Loop is now **${this.enabled ? 'enabled' : 'disabled'}**.`)
      .setColor(this.enabled ? '#00ff91' : '#ff4d4d');
    return this.build();
  }
}
