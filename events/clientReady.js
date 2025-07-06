import { Events } from "discord.js";
import { monitorTempbans } from "../tasks/tempbanMonitor.js";
import chalk from 'chalk';

export default {
  name: Events.ClientReady,
  async execute(client) {
    console.log(`[${new Date()}] ${chalk.greenBright(`${client.user.tag} Logged in.`)}`);

    // temp ban monitor
    monitorTempbans(client);

    //status
    client.user.setActivity('default prefix miku')
  },
};
