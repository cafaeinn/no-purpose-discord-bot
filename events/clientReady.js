import { Events } from "discord.js";
import chalk from 'chalk';
import { monitorTempbans } from "../tasks/tempbanMonitor.js";

export default {
  name: Events.ClientReady,
  async execute(client) {
    console.log(`[${new Date()}] ${chalk.greenBright(`${client.user.tag} Logged in.`)}`);

    // temp ban monitor
    monitorTempbans(client);

    // set status
    client.user.setActivity('default prefix miku');
  },
};
