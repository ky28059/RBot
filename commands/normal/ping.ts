import {CommandInteraction, Message} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {reply} from '../../utils/messageUtils';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Gets the latency of the bot.'),
    async execute(message: Message | CommandInteraction) {
        const m = await reply(message, 'Ping?');
        // APIMessage is only ever returned if message is a CommandInteraction
        if (!(m instanceof Message))
            return message instanceof CommandInteraction && message.editReply('Pong!');

        await m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(message.client.ws.ping)}ms`)
    }
}
