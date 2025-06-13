import { Events } from 'discord.js';
import { handleLeave } from '../tasks/handleLeave.js';

export default {
  name: Events.GuildMemberRemove,
  async execute(member, client) {
    await handleLeave(member);
  }
};
