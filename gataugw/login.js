import { Events } from "discord.js";
import chalk from "chalk";
import { monitorTempbans } from "../tasks/tempbanMonitor.js";

async function loginBang(client, token) {
  client.login(token);

  client.on(Events.ClientReady, () => {
    console.log(`[${new Date()}] ${chalk.greenBright(`${client.user.tag} Logged in.`)}`);

    // temp ban monitor
    monitorTempbans(client);
  });
}

export default loginBang;
