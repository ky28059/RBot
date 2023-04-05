import {createGuildOnlySlashCommand} from '../../util/commands';
import {GuildMember} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {AudioPlayerStatus} from '@discordjs/voice';

// Utils
import { canModifyQueue } from '../../util/canModifyQueue';
import {replyEmbed} from '../../util/messageUtils';
import {pause} from '../../util/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';
import MemberNotInSameVCError from '../../errors/MemberNotInSameVCError';
import ActionUntakeableError from '../../errors/ActionUntakeableError';


export const data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pauses the currently playing song.')
    .setDMPermission(false)

export default createGuildOnlySlashCommand({
    data,
    async execute(message) {
        if (!message.member || !(message.member instanceof GuildMember)) return;
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription)
            throw new QueueNonexistentError(data.name);
        if (!canModifyQueue(message.member))
            throw new MemberNotInSameVCError(data.name);
        if (subscription.audioPlayer.state.status === AudioPlayerStatus.Paused)
            throw new ActionUntakeableError(data.name, 'Music already paused.');

        subscription.audioPlayer.pause();
        await replyEmbed(message, pause());
    }
});
