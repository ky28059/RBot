import {CommandInteraction, GuildMember, Message} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import { canModifyQueue } from '../utils/canModifyQueue';
import {die} from '../../utils/messages';

import QueueNonexistentError from '../../errors/QueueNonexistentError';


export default {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Kills the music.'),
    aliases: ['die', 'leave', 'dc'],
    guildOnly: true,
    async execute(message: Message | CommandInteraction) {
        if (!message.member || !(message.member instanceof GuildMember)) return;

        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription) throw new QueueNonexistentError('disconnect');
        if (!canModifyQueue(message.member!)) return;

        subscription.voiceConnection.destroy();
        message.client.subscriptions.delete(message.guild!.id);

        await message.reply({embeds: [die()]});
    }
};
