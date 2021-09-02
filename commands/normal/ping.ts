import {CommandInteraction, Message} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Gets the latency of the bot.'),
    async execute(interaction: CommandInteraction) {
        const m = await interaction.followUp('Ping?');
        if (!(m instanceof Message)) return interaction.editReply('Pong!');
        await interaction.editReply(`Pong! Latency is ${m.createdTimestamp - interaction.createdTimestamp}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`);
    }
}
