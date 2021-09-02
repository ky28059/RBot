import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { token } from './auth';
import fs from 'fs';
import {Command, SlashCommand} from './bot';

const commands: Object[] = []; // better type perhaps
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const clientId = '123456789012345678';

// Only push slash commands
for (const file of commandFiles) {
    import(`./commands/${file}`)
        .then((command: Command | SlashCommand) => 'data' in command && commands.push(command.data.toJSON()));
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
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
