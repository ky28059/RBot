import {Message, MessageEmbed, Util} from 'discord.js';
import {AudioPlayerStatus, AudioResource} from '@discordjs/voice';
import {RBot} from '../../bot';
import {Track} from '../utils/track';
import {pagedMessage} from '../../utils/messageUtils';

import QueueNonexistentError from '../../errors/QueueNonexistentError';


export default {
    name: 'queue',
    aliases: ['q'],
    description: 'Displays the current music queue.',
    examples: 'queue',
    guildOnly: true,
    async execute(message: Message, parsed: {}, client: RBot) {
        const subscription = client.subscriptions.get(message.guild!.id);

        if (!subscription) throw new QueueNonexistentError(this.name);

        const current =
            subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
                ? `Nothing is currently playing!`
                : `Playing **${(subscription.audioPlayer.state.resource as AudioResource<Track>).metadata.title}**`;

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
