import fs from 'node:fs';
import path from 'node:path';
import { REST, Routes } from "discord.js";
import fileDirName from "./utils/fileAndDirName.js";
import 'dotenv/config';

const { __dirname, __filename } = fileDirName(import.meta);
const commands = [];

//? Registering every commands in commands array
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
	const { command } = await import('file://'+filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

//? Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.BOT_TOKEN);

//? Deploying commands
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.BOT_ID, process.env.GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();