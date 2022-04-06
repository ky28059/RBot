import {CommandInteraction, Message, MessageEmbed, Util} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {AudioPlayerStatus, AudioResource} from '@discordjs/voice';

// Utilities
import {pagedMessage, reply} from '../../utils/messageUtils';
import {Track} from '../../utils/track';
import {success} from '../../utils/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';


export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current music queue.'),
    aliases: ['q'],
    guildOnly: true,
    async execute(message: Message | CommandInteraction) {
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription) throw new QueueNonexistentError('queue');

        // TODO: do something with this
        const current =
            subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
                ? `Nothing is currently playing!`
                : `Playing **${(subscription.audioPlayer.state.resource as AudioResource<Track>).metadata.title}**`;

        // If the queue is empty
        if (!subscription.queue.length)
            return reply(message, {embeds: [success({title: 'Queue', desc: 'Nothing is in the queue.'})]});

        // TODO: make this look better
        const description = subscription.queue.map((track, index) => {
            const seconds = track.length % 60;
            const minutes = (track.length - seconds) / 60;

            return `${index + 1}) ${Util.escapeMarkdown(track.title)} ${minutes}:${seconds}`;
        });

        const queueEmbed = new MessageEmbed()
            .setAuthor('Queue')
            .setColor('#F8AA2A');

        const splitDescription = Util.splitMessage(`\`\`\`elm\n${description.join('\n')}\n\`\`\``, {
            maxLength: 2048,
            char: '\n',
            prepend: '```elm\n',
            append: '```'
        });

        await pagedMessage(message, splitDescription.map(m => new MessageEmbed(queueEmbed).setDescription(m)));
    }
};
