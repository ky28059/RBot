import { REST } from '@discordjs/rest';
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v9';
import { token } from './auth';
import { readdirSync } from 'fs';
import {Command, SlashCommand} from './bot';


const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

const clientId = '684587440777986090';
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    // Dynamically import commands
    const submodules = readdirSync('./commands', {withFileTypes: true})
        .filter(res => res.isDirectory())
        .map(dir => dir.name);
    console.log(`Detected submodules: [${submodules.join(', ')}]`);

    for (const dir of submodules) {
        const commandFiles = readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.ts'));

        // Only push slash commands
        for (const file of commandFiles) {
            const command = (await import(`./commands/${dir}/${file.substring(0, file.length - 3)}`)).default as Command | SlashCommand;
            if ('data' in command) {
                commands.push(command.data.toJSON());
                console.log(`[PUSHED] ${command.data.name}`);
            }
        }
    }

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
