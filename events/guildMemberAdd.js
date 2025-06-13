import { Events } from "discord.js";
import handleWelcome from "../tasks/welcomeTask.js";

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    await handleWelcome(member);
  },
};
