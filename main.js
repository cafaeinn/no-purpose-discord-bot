// main.js
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import config from './kanjut/config.js';

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

// Music setup
import PlayerManager from './music/PlayerManager.js';
import registerMusicEvents from './tasks/musicEvents.js';

client.playerManager = new PlayerManager(client);
registerMusicEvents(client);

// Bot login
await client.login(config.token);

// Global event handlers
client.on('error', console.error);
client.on('shardError', console.error);
client.on('disconnect', () => console.warn('Bot disconnected!'));
client.on('reconnecting', () => console.log('Reconnecting...'));

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);
