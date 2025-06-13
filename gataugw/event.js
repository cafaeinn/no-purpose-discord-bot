import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  const files = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const event = (await import(`../events/${file}`)).default;
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}
