import { MusicEmbed } from './MusicEmbed.js';

export class QueueEmbed extends MusicEmbed {
  constructor(queue, currentTrack) {
    super();
    this.queue = queue;
    this.currentTrack = currentTrack;
  }

  buildEmbed() {
    this.setTitle('📜 Music Queue');

    if (!this.queue.length) {
      this.setDescription('The queue is currently **empty**.');
    } else {
      const trackLines = this.queue
        .slice(0, 10)
        .map((track, i) => `${i + 1}. [${track.info.title}](${track.info.uri})`)
        .join('\n');

      this.setDescription(trackLines);
      if (this.queue.length > 10) {
        this.addField('…', `+${this.queue.length - 10} more`);
      }
    }

    if (this.currentTrack) {
      this.addField('🎶 Now Playing', `[${this.currentTrack.info.title}](${this.currentTrack.info.uri})`);
    }

    return this.build();
  }
}
