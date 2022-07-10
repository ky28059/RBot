import {createSlashCommand} from '../../utils/parseCommands';
import {MessageEmbed, Util} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {AudioPlayerStatus, AudioResource} from '@discordjs/voice';
import {Track} from '../../utils/track';

// Utilities
import {pagedMessage, replyEmbed} from '../../utils/messageUtils';
import {success} from '../../utils/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';


export const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Displays the current music queue.')
    .setDMPermission(false)

export default createSlashCommand<{}, true>(
    data,
    async (message) => {
        const subscription = message.client.subscriptions.get(message.guild!.id);
        if (!subscription) throw new QueueNonexistentError('queue');

        // TODO: do something with this
        const current =
            subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
                ? `Nothing is currently playing!`
                : `Playing **${(subscription.audioPlayer.state.resource as AudioResource<Track>).metadata.title}**`;

        // If the queue is empty
        if (!subscription.queue.length)
            return replyEmbed(message, success().setAuthor({name: 'Queue'}).setDescription('Nothing is in the queue.'));

        // TODO: make this look better
        const description = subscription.queue.map((track, index) => {
            const seconds = track.length % 60;
            const minutes = (track.length - seconds) / 60;

            return `${index + 1}) ${Util.escapeMarkdown(track.title)} ${minutes}:${seconds}`;
        });

        const queueEmbed = success()
            .setAuthor({name: 'Queue'});

        const splitDescription = Util.splitMessage(`\`\`\`elm\n${description.join('\n')}\n\`\`\``, {
            maxLength: 2048,
            char: '\n',
            prepend: '```elm\n',
            append: '```'
        });

        await pagedMessage(message, splitDescription.map(m => new MessageEmbed(queueEmbed).setDescription(m)));
    }, {
        aliases: ['q']
    }
);
