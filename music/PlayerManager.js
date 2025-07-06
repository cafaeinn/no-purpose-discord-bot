import { BaseMusicManager } from './BaseMusicManager.js';

class PlayerManager extends BaseMusicManager {
  constructor(client) {
    super(client);
    this.client = client;
    this.queues = new Map();
    this.nowPlaying = new Map();
    this.loopMode = new Map();
  }

  setLoopMode(guildId, mode) {
    if (!['off', 'track', 'queue'].includes(mode)) return;
    this.loopMode.set(guildId, mode);
  }

  getLoopMode(guildId) {
    return this.loopMode.get(guildId) || 'off';
  }

  getNowPlaying(guildId) {
    return this.nowPlaying.get(guildId) || null;
  }

  getQueue(guildId) {
    return this.queues.get(guildId);
  }

  setQueue(guildId, queue) {
    this.queues.set(guildId, queue);
  }

  deleteQueue(guildId) {
    this.queues.delete(guildId);
  }

  getIdealNode() {
    const nodes = this.client.shoukaku.nodes.values();
    return nodes.next().value || null;
  }

  async play(guildId, voiceChannel, query, textChannel) {
    const node = this.getIdealNode();
    if (!node) throw new Error('No Lavalink nodes available');

    const result = await node.rest.resolve(query);
    if (!result || !result.tracks.length) throw new Error('Track not found');

    const track = result.tracks[0];
    let queue = this.getQueue(guildId);

    if (!queue) {
      const conn = await node.joinChannel({
        guildId,
        channelId: voiceChannel.id,
        shardId: voiceChannel.guild.shardId,
        deaf: true,
      });

      queue = { conn, tracks: [], playing: false, textChannel };
      this.setQueue(guildId, queue);
    }

    queue.tracks.push(track);

    if (!queue.playing) {
      this._playNext(guildId);
    } else {
      this.client.emit('trackAdd', {
        guildId,
        track
      });
    }
  }

  async _playNext(guildId) {
    const queue = this.getQueue(guildId);
    if (!queue || (!queue.tracks.length && this.getLoopMode(guildId) !== 'track')) {
      queue?.conn.disconnect();
      this.deleteQueue(guildId);
      this.nowPlaying.delete(guildId);
      this.loopMode.delete(guildId);
      return;
    }

    const loopMode = this.getLoopMode(guildId);
    const current = loopMode === 'track'
      ? this.getNowPlaying(guildId)
      : queue.tracks.shift();

    if (!current) return;

    queue.playing = true;
    this.nowPlaying.set(guildId, current);
    queue.conn.player.playTrack({ track: current.track });

    // ✅ Emit trackStart event
    this.client.emit('trackStart', {
      guildId,
      track: current
    });

    queue.conn.player.once('end', () => {
      queue.playing = false;
      if (loopMode === 'queue') {
        queue.tracks.push(current);
      }
      this._playNext(guildId);
    });
  }

  skip(guildId) {
    const queue = this.getQueue(guildId);
    if (queue) queue.conn.player.stopTrack();
  }

  stop(guildId) {
    const queue = this.getQueue(guildId);
    if (queue) {
      queue.conn.disconnect();
      this.deleteQueue(guildId);
      this.nowPlaying.delete(guildId);
      this.loopMode.delete(guildId);
    }
  }

  pause(guildId) {
    this.getQueue(guildId)?.conn.player.setPaused(true);
  }

  resume(guildId) {
    this.getQueue(guildId)?.conn.player.setPaused(false);
  }
}

export default PlayerManager;
