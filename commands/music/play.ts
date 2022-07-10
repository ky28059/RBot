import {createSlashCommand} from '../../utils/parseCommands';
import {GuildMember, StageChannel} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {entersState, joinVoiceChannel, VoiceConnectionStatus} from '@discordjs/voice';

// Utilities
import {author, replyEmbed} from '../../utils/messageUtils';
import {Track} from '../../utils/track';
import {MusicSubscription} from '../../utils/subscription';
import {err, nowPlaying, success} from '../../utils/messages';

// Errors
import MemberNotInVCError from '../../errors/MemberNotInVCError';
import MusicAlreadyBoundError from '../../errors/MusicAlreadyBoundError';
import ActionUntakeableError from '../../errors/ActionUntakeableError';


export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a video from youtube.')
    .setDMPermission(false)
    .addStringOption(option => option
        .setName('url')
        .setDescription('The video to play.')
        .setRequired(true))

export default createSlashCommand<{url: string}, true>(
    data,
    async (message, parsed) => {
        if (!message.member || !(message.member instanceof GuildMember)) return;

        const { channel } = message.member.voice;
        let subscription = message.client.subscriptions.get(message.guild!.id);

        if (!channel)
            throw new MemberNotInVCError('play');
        if (!channel.joinable)
            throw new ActionUntakeableError('play', `Cannot connect to channel \`${channel.name}\`, missing permissions`);
        if (channel instanceof StageChannel || !channel.speakable)
            throw new ActionUntakeableError('play', `Cannot speak in channel \`${channel.name}\`, missing permissions`);
        if (subscription && message.guild!.me!.voice.channel && channel !== message.guild!.me!.voice.channel)
            throw new MusicAlreadyBoundError('play', message.guild!.me!.voice.channel, channel);

        // If the subscription doesn't exist or if its VoiceConnection has been destroyed after a forced disconnect,
        // create a new subscription and VoiceConnection by joining the channel
        if (!subscription || !message.guild!.me!.voice.channel) {
            subscription = new MusicSubscription(
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                }),
            );
            subscription.voiceConnection.on('error', console.warn);
            message.client.subscriptions.set(message.guild!.id, subscription);
        }

        await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);

        // Attempt to create a Track from the user's video URL
        const track = await Track.from(parsed.url, author(message).id, {
            onStart() {
                message.channel?.send({embeds: [nowPlaying(track)]}).catch(console.warn);
            },
            onFinish() { },
            onError(error) {
                console.warn(error);
                message.channel?.send({embeds: [err(error.name, error.message)]}).catch(console.warn);
            },
        });

        // Enqueue the track and reply a success message to the user
        subscription.enqueue(track);
        await replyEmbed(message, success().setDescription(`Enqueued **${track.title}**`));
    }, {
        aliases: ['p'],
        examples: ['play https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
        clientPermReqs: 'CONNECT'
    }
);
