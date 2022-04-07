import {CommandInteraction, Message} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {AudioPlayerStatus, AudioResource} from '@discordjs/voice';

// Utilities
import {reply, replyEmbed} from '../../utils/messageUtils';
import {Track} from '../../utils/track';
import {nowPlaying, success} from '../../utils/messages';

// Errors
import QueueNonexistentError from '../../errors/QueueNonexistentError';


export default {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Displays the currently playing song.'),
    aliases: ['np'],
    guildOnly: true,
    async execute(message: Message | CommandInteraction) {
        const subscription = message.client.subscriptions.get(message.guild!.id);

        if (!subscription) throw new QueueNonexistentError('nowplaying');

        // If nothing is currently playing
        if (subscription.audioPlayer.state.status === AudioPlayerStatus.Idle)
            return replyEmbed(message, success().setDescription('Nothing is playing!'));

        const track = (subscription.audioPlayer.state.resource as AudioResource<Track>).metadata;
        await replyEmbed(message, nowPlaying(track));
    }
};
