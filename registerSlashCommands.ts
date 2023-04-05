import { REST } from '@discordjs/rest';
import {RESTPostAPIApplicationCommandsJSONBody, Routes} from 'discord-api-types/v9';
import { token } from './auth';
import {forEachRawCommand, getSubmodules} from './util/commands';


const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

const clientId = '684587440777986090';
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    // Dynamically import commands
    const submodules = getSubmodules();
    console.log(`Detected submodules: [${submodules.join(', ')}]`);

    await forEachRawCommand(submodules, ({data, dir}) => {
        // Only push slash commands
        if (!data) return;
        commands.push(data.toJSON());
        console.log(`[PUSHED] ${dir}/${data.name}`);
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
