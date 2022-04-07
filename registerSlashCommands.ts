import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { token } from './auth';
import {forEachRawCommand, getSubmodules} from './utils/parseCommands';
import {SlashCommandBuilder} from "@discordjs/builders";


// TODO: `ReturnType<SlashCommandBuilder['toJSON']>` is a hacky fix to a `discord-api-types` conflict;
// ideally this would be unnecessary and `RESTPostAPIApplicationCommandsJSONBody` could be used directly
const commands: ReturnType<SlashCommandBuilder['toJSON']>[] = [];

const clientId = '684587440777986090';
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    // Dynamically import commands
    const submodules = getSubmodules();
    console.log(`Detected submodules: [${submodules.join(', ')}]`);

    await forEachRawCommand(submodules, (command, dir) => {
        // Only push slash commands
        if ('data' in command) {
            commands.push(command.data.toJSON());
            console.log(`[PUSHED] ${command.data.name}`);
        }
    });

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
