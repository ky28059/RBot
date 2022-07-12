import {createGuildOnlySlashCommand} from '../../utils/commands';
import {GuildMember} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {AudioPlayerStatus} from '@discordjs/voice';

// Utils
import { canModifyQueue } from '../../utils/canModifyQueue';
import {replyEmbed} from '../../utils/messageUtils';
import {unpause} from '../../utils/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';
import MemberNotInSameVCError from '../../errors/MemberNotInSameVCError';
import ActionUntakeableError from '../../errors/ActionUntakeableError';


export const data = new SlashCommandBuilder()
    .setName('unpause')
    .setDescription('Unpauses the currently playing song.')
    .setDMPermission(false)

export default createGuildOnlySlashCommand({
    data,
    async execute(message) {
        if (!message.member || !(message.member instanceof GuildMember)) return;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription)
            throw new QueueNonexistentError('unpause');
        if (!canModifyQueue(message.member))
            throw new MemberNotInSameVCError('unpause');
        if (subscription.audioPlayer.state.status !== AudioPlayerStatus.Paused)
            throw new ActionUntakeableError('unpause', 'Music not paused.');

        subscription.audioPlayer.unpause();
        await replyEmbed(message, unpause());
    }
});
