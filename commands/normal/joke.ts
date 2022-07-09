import {SlashCommand} from '../../utils/parseCommands';
import {CommandInteraction, Message} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import fetch from 'node-fetch';

// Utilities
import {author, replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';


const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Tells a random joke from https://official-joke-api.appspot.com/.'),
    async execute(message: Message | CommandInteraction) {
        const joke = await (await fetch('https://official-joke-api.appspot.com/random_joke')).json()

        const jokeEmbed = success()
            .setTitle(joke.setup)
            .setDescription(joke.punchline)
            .setFooter({text: `Joke #${joke.id}, requested by ${author(message).tag}`});

        await replyEmbed(message, jokeEmbed);
    }
}

export default command;
