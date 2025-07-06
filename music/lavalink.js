import { Shoukaku, Connectors } from 'shoukaku';

export let shoukaku;

export function initLavalink(client) {
  const nodes = [
    { name: 'Local', url: 'localhost:2333', auth: 'youshallnotpass' }
  ];

  shoukaku = new Shoukaku(new Connectors.DiscordJS(client), nodes);

  shoukaku.on('ready', name => console.log(`Lavalink node ${name} is ready!`));
  shoukaku.on('error', (name, error) => console.error(`Node ${name} error:`, error));
}
