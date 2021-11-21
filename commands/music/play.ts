import {CommandInteraction, GuildMember, Message, StageChannel} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {entersState, joinVoiceChannel, VoiceConnectionStatus} from '@discordjs/voice';
import {reply} from '../../utils/messageUtils';
import {Track} from '../utils/track';
import {MusicSubscription} from '../utils/subscription';
import {err, nowPlaying, success} from '../../utils/messages';

// Errors
import MemberNotInVCError from '../../errors/MemberNotInVCError';
import MusicAlreadyBoundError from '../../errors/MusicAlreadyBoundError';


export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a video from youtube.')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The video to play')
                .setRequired(true)),
    aliases: ['p'],
    examples: ['play https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    guildOnly: true,
    clientPermReqs: 'CONNECT',
    async execute(message: Message | CommandInteraction, parsed: {url: string}) {
        if (!message.member || !(message.member instanceof GuildMember)) return;

        const { channel } = message.member.voice;
        let subscription = message.client.subscriptions.get(message.guild!.id);

        if (!channel) throw new MemberNotInVCError('play');

        if (!channel.joinable)
            return reply(message, 'Cannot connect to voice channel, missing permissions');
        if (channel instanceof StageChannel || !channel.speakable)
            return reply(message, 'I cannot speak in this voice channel, make sure I have the proper permissions!');

        if (subscription && channel !== message.guild!.me!.voice.channel)
            throw new MusicAlreadyBoundError('play', message.guild!.me!.voice.channel!, channel);

        const url = parsed.url;

        if (!subscription) {
            if (message.member.voice.channel) {
                const channel = message.member.voice.channel;
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
        }

        // If there is no subscription, tell the user they need to join a channel.
        if (!subscription) {
            await reply(message, 'Join a voice channel and then try that again!');
            return;
        }

        await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);

        // Attempt to create a Track from the user's video URL
        const track = await Track.from(url, {
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
        await reply(message, {embeds: [success({desc: `Enqueued **${track.title}**`})]});
    }
};
