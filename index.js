import fs from 'node:fs';
import path from 'node:path';
import fileDirName from './utils/fileAndDirName.js';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { __dirname, __filename } = fileDirName(import.meta);

//? Registering commands
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
	const { command } = await import('file://'+filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

//? Registering buttons
client.buttons = new Collection();

const buttonsPath = path.join(__dirname, 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
	const filePath = path.join(buttonsPath, file);
	const { button } = await import('file://'+filePath);
	if ('name' in button && 'execute' in button) {
        client.buttons.set(button.name, button);
    } else {
        console.log(`[WARNING] The button at ${filePath} is missing a required "name" or "execute" property.`);
    }
}

//? Registering modals
client.modals = new Collection();

const modalsPath = path.join(__dirname, 'modals');
const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));

for (const file of modalFiles) {
	const filePath = path.join(modalsPath, file);
	const { modal } = await import('file://'+filePath);
	if ('name' in modal && 'execute' in modal) {
        client.modals.set(modal.name, modal);
    } else {
        console.log(`[WARNING] The modal at ${filePath} is missing a required "name" or "execute" property.`);
    }
}

//? Registering events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const { event } = await import('file://'+filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env.BOT_TOKEN);