import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User
    ]
});

import config from './kanjut/config.js';

client.commands = new Collection();

import { loadCommands } from './gataugw/komen.js';
import { loadEvents } from './gataugw/event.js';

await loadCommands(client);
await loadEvents(client);
//login
await client.login(config.token);

await client.on('error', console.error);
await client.on('shardError', console.error);
await client.on('disconnect', () => console.warn('Bot disconnected!'));
await client.on('reconnecting', () => console.log('Reconnecting...'));

await process.on('unhandledRejection', console.error);
await process.on('uncaughtException', console.error);