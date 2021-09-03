import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { token } from './auth';
import fs from 'fs';
import {Command, SlashCommand} from './bot';

const commands: Object[] = []; // better type perhaps
(async () => {
    console.log('Importing command files');

    for (let dir of ['admin', 'music', 'normal', 'owner', 'presets']) {
        const commandFiles = fs.readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.ts'));

        // Only push slash commands
        for (const file of commandFiles) {
            const command = (await import(`./commands/${dir}/${file.substring(0, file.length - 3)}`)).default as Command | SlashCommand
            if ('data' in command) commands.push(command.data.toJSON());
        }
    }

    const clientId = '684587440777986090';
    const rest = new REST({ version: '9' }).setToken(token);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

