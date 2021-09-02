import {CommandInteraction, Message, MessageEmbed} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import fetch from 'node-fetch';
import {author, reply} from '../../utils/messageUtils';

export default {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Tells a random joke from https://official-joke-api.appspot.com/.'),
    async execute(message: Message | CommandInteraction) {
        let joke = await (await fetch('https://official-joke-api.appspot.com/random_joke')).json()

        const jokeEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle(joke.setup)
            .setDescription(joke.punchline)
            .setFooter(`Joke #${joke.id}, requested by ${author(message).tag}`)

        await reply(message, {embeds: [jokeEmbed]});
    }
}
