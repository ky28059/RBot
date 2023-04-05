import {createGuildOnlySlashCommand} from '../../util/commands';
import {CommandInteraction, GuildMember, StageChannel} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {entersState, joinVoiceChannel, VoiceConnectionStatus} from '@discordjs/voice';

// Utilities
import {author, deferredReplyEmbed} from '../../util/messageUtils';
import {Track} from '../../util/track';
import {MusicSubscription} from '../../util/subscription';
import {err, nowPlaying, success} from '../../util/messages';

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

export default createGuildOnlySlashCommand<{url: string}>({
    data,
    aliases: ['p'],
    examples: ['play https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    clientPermReqs: 'Connect',
    async execute(message, parsed) {
        if (!message.member || !(message.member instanceof GuildMember)) return;
        if (message instanceof CommandInteraction) await message.deferReply();

        const { channel } = message.member.voice;
        let subscription = message.client.subscriptions.get(message.guild!.id);
        const currChannel = message.guild!.members.me!.voice.channel;

        if (!channel)
            throw new MemberNotInVCError(data.name);
        if (!channel.joinable)
            throw new ActionUntakeableError(data.name, `Cannot connect to channel \`${channel.name}\`, missing permissions`);
        if (channel instanceof StageChannel || !channel.speakable)
            throw new ActionUntakeableError(data.name, `Cannot speak in channel \`${channel.name}\`, missing permissions`);
        if (subscription && currChannel && channel !== currChannel)
            throw new MusicAlreadyBoundError(data.name, currChannel, channel);

        // If the subscription doesn't exist or if its VoiceConnection has been destroyed after a forced disconnect,
        // create a new subscription and VoiceConnection by joining the channel
        if (!subscription || !currChannel) {
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
        await deferredReplyEmbed(message, success().setDescription(`Enqueued **${track.title}**`));
    }
});
