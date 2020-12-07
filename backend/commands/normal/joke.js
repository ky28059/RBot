import fetch from 'node-fetch';
import {MessageEmbed} from 'discord.js';

export default {
    name: 'joke',
    description: 'Tells a random joke from https://official-joke-api.appspot.com/.',
    usage: 'joke',
    examples: 'joke',
    async execute(message) {
        let joke;
        await fetch('https://official-joke-api.appspot.com/random_joke')
            .then(response => response.json())
            .then(body => joke = body);

        console.log(joke)

        const jokeEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setTitle(joke.setup)
            .setDescription(joke.punchline)
            .setFooter(`Joke number ${joke.id}, requested by ${message.author.tag}`)

        message.channel.send(jokeEmbed);
    }
}
