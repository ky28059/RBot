import {createSlashCommand} from '../../util/commands';
import {SlashCommandBuilder} from '@discordjs/builders';
import fetch from 'node-fetch';

// Utilities
import {author, replyEmbed} from '../../util/messageUtils';
import {success} from '../../util/messages';


export const data = new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Tells a random joke from https://official-joke-api.appspot.com/.')

export default createSlashCommand({
    data,
    async execute(message) {
        const joke = await (await fetch('https://official-joke-api.appspot.com/random_joke')).json()

        const jokeEmbed = success()
            .setTitle(joke.setup)
            .setDescription(joke.punchline)
            .setFooter({text: `Joke #${joke.id}, requested by ${author(message).tag}`});

        await replyEmbed(message, jokeEmbed);
    }
});
