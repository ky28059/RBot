import {CommandInteraction, Message, MessageEmbed, Util} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {AudioPlayerStatus, AudioResource} from '@discordjs/voice';
import {Track} from '../utils/track';
import {pagedMessage} from '../../utils/messageUtils';

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

        const current =
            subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
                ? `Nothing is currently playing!`
                : `Playing **${(subscription.audioPlayer.state.resource as AudioResource<Track>).metadata.title}**`;

        // TODO: make this look better and contain more information
        // such as song length and "queued by"
        const description = subscription.queue
            .map((track, index) => `${index + 1}) ${Util.escapeMarkdown(track.title)}`)

        let queueEmbed = new MessageEmbed()
            .setTitle('Music Queue')
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
