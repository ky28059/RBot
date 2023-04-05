import {createGuildOnlySlashCommand} from '../../util/commands';
import {GuildMember} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';

// Utilities
import { canModifyQueue } from '../../util/canModifyQueue';
import {replyEmbed} from '../../util/messageUtils';
import {skip} from '../../util/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';
import MemberNotInSameVCError from '../../errors/MemberNotInSameVCError';


export const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the currently playing song.')
    .setDMPermission(false)

export default createGuildOnlySlashCommand({
    data,
    aliases: ['s'],
    async execute(message) {
        if (!message.member || !(message.member instanceof GuildMember)) return;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription)
            throw new QueueNonexistentError(data.name);
        if (!canModifyQueue(message.member))
            throw new MemberNotInSameVCError(data.name);

        subscription.next();
        await replyEmbed(message, skip());
    }
});
