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

import loginBang from './gataugw/login.js';
import { loadCommands } from './gataugw/komen.js';
import { loadEvents } from './gataugw/event.js';

await loadCommands(client);
await loadEvents(client);
await loginBang(client, config.token);