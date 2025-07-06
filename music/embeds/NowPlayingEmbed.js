import { MusicEmbed } from './MusicEmbed.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultImagePath = path.resolve(__dirname, '../assets/miku.gif');

export class NowPlayingEmbed extends MusicEmbed {
  constructor(trackInfo) {
    super();
    this.track = trackInfo;
  }

  async buildEmbed() {
    this.setTitle('🎶 Now Playing')
      .setDescription(`[${this.track.title}](${this.track.uri})`)
      .addField('Duration', formatDuration(this.track.length), true)
      .addField('Author', this.track.author, true);

    const hasArtwork = !!this.track.artworkUrl;
    if (hasArtwork) this.setThumbnail(this.track.artworkUrl);

    return {
      embed: this.build(),
      file: hasArtwork
        ? null
        : {
            attachment: createReadStream(defaultImagePath),
            name: 'miku.gif'
          }
    };
  }
}

// Helper
function formatDuration(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
