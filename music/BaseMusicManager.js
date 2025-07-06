import { shoukaku } from './lavalink.js';

export class BaseMusicManager {
  constructor(client) {
    this.client = client;
    this.queues = new Map();
  }

  getQueue(guildId) {
    return this.queues.get(guildId);
  }

  setQueue(guildId, data) {
    this.queues.set(guildId, data);
  }

  deleteQueue(guildId) {
    this.queues.delete(guildId);
  }

  getIdealNode() {
    const node = shoukaku.getIdealNode();
    if (!node) throw new Error('No Lavalink nodes available');
    return node;
  }

  async resolveQuery(query) {
    const node = this.getIdealNode();
    const result = await node.rest.resolve(query);
    if (!result || !result.tracks.length) throw new Error('Track not found');
    return result.tracks[0];
  }

  async connectToVoice(guildId, voiceChannel) {
    const node = this.getIdealNode();
    return await node.joinChannel({
      guildId,
      channelId: voiceChannel.id,
      shardId: voiceChannel.guild.shardId,
      deaf: true
    });
  }
}
