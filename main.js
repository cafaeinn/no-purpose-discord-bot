// main.js
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { Kazagumo, Payload, KazagumoTrack } from "kazagumo";
import { Connectors } from "shoukaku";
import SpotifyPlugin from "kazagumo-spotify";
import DeezerPlugin from "kazagumo-deezer";
import ApplePlugin from "kazagumo-apple";
import FilterPlugin from "kazagumo-filter";
import config from './kanjut/config.js';

const kazagumo = new Kazagumo(
  {
    plugins: [
      new SpotifyPlugin({ clientId: config.spotId, clientSecret: config.spotSec }),
      new ApplePlugin({ countryCode: 'us' }),
      new DeezerPlugin({ playlistLimit: 20 }),
      new FilterPlugin(),
    ],
    defaultSearchEngine: 'spotify', // or 'deezer'/'apple'
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    }
  },
  [{ name: 'main', url: 'localhost:2333', auth: 'youshallnotpass' }],
  new Connectors.DiscordJS(client)
);

const Nodes = [{
    name: 'owo',
    url: 'localhost:2333',
    auth: 'youshallnotpass',
    secure: false
}];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User
  ]
});

// Load commands and events
client.commands = new Collection();
import { loadCommands } from './gataugw/komen.js';
import { loadEvents } from './gataugw/event.js';
await loadCommands(client);
await loadEvents(client);

// ✅ Login to Discord
await client.login(config.token);

// 🔄 Error handling
client.on('error', console.error);
client.on('shardError', console.error);
client.on('disconnect', () => console.warn('Bot disconnected!'));
client.on('reconnecting', () => console.log('Reconnecting...'));
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);
