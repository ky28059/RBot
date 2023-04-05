import {createGuildOnlySlashCommand} from '../../util/commands';
import {EmbedBuilder, escapeMarkdown} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {AudioPlayerStatus, AudioResource} from '@discordjs/voice';
import {Track} from '../../util/track';

// Utilities
import {pagedMessage, replyEmbed, splitMessage} from '../../util/messageUtils';
import {success} from '../../util/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';


export const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Displays the current music queue.')
    .setDMPermission(false)

export default createGuildOnlySlashCommand({
    data,
    aliases: ['q'],
    async execute(message) {
        const subscription = message.client.subscriptions.get(message.guild!.id);
        if (!subscription) throw new QueueNonexistentError(data.name);

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

            return `${index + 1}) ${escapeMarkdown(track.title)} ${minutes}:${seconds}`;
        });

        const queueEmbed = success()
            .setAuthor({name: 'Queue'});

        const splitDescription = splitMessage(`\`\`\`elm\n${description.join('\n')}\n\`\`\``, {
            len: 2048,
            char: '\n',
            prepend: '```elm\n',
            append: '```'
        });

        await pagedMessage(message, splitDescription.map(m => EmbedBuilder.from(queueEmbed).setDescription(m)));
    }
});
