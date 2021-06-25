import fetch from 'node-fetch';
import {MessageEmbed} from 'discord.js';

export default {
    name: 'joke',
    description: 'Tells a random joke from https://official-joke-api.appspot.com/.',
    examples: 'joke',
    async execute(message) {
        let joke = await (await fetch('https://official-joke-api.appspot.com/random_joke')).json()

        const jokeEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle(joke.setup)
            .setDescription(joke.punchline)
            .setFooter(`Joke #${joke.id}, requested by ${message.author.tag}`)

        message.channel.send(jokeEmbed);
    }
}
