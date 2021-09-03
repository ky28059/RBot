import {Message, StageChannel} from 'discord.js';
import {entersState, joinVoiceChannel, VoiceConnectionStatus} from '@discordjs/voice';
import {Track} from '../utils/track';
import {MusicSubscription} from '../utils/subscription';

import {success} from '../../utils/messages.js';

// Errors
import MemberNotInVCError from '../../errors/MemberNotInVCError';
import MusicAlreadyBoundError from '../../errors/MusicAlreadyBoundError';


export default {
    name: 'play',
    aliases: ['p'],
    description: 'Plays music from youtube.',
    pattern: '<Video>',
    examples: ['play Never Gonna Give You Up', 'play https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    guildOnly: true,
    clientPermReqs: 'CONNECT',
    async execute(message: Message, parsed: {video: string}) {
        const { channel } = message.member!.voice;
        let subscription = message.client.subscriptions.get(message.guild!.id);

        if (!channel) throw new MemberNotInVCError(this.name);

        if (!channel.joinable)
            return message.reply('Cannot connect to voice channel, missing permissions');
        if (channel instanceof StageChannel || !channel.speakable)
            return message.reply('I cannot speak in this voice channel, make sure I have the proper permissions!');

        if (subscription && channel !== message.guild!.me!.voice.channel)
            throw new MusicAlreadyBoundError(this.name, message.guild!.me!.voice.channel!, channel);

        const url = parsed.video;

        if (!subscription) {
            if (message.member?.voice.channel) {
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
            await message.reply('Join a voice channel and then try that again!');
            return;
        }

        await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);

        // Attempt to create a Track from the user's video URL
        const track = await Track.from(url, {
            onStart() {
                message.reply({ content: 'Now playing!' }).catch(console.warn);
            },
            onFinish() {
                message.reply({ content: 'Now finished!' }).catch(console.warn);
            },
            onError(error) {
                console.warn(error);
                message.reply({ content: `Error: ${error.message}` }).catch(console.warn);
            },
        });

        // Enqueue the track and reply a success message to the user
        subscription.enqueue(track);
        await message.reply(`Enqueued **${track.title}**`);
    }
};
