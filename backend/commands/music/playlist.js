import { MessageEmbed } from 'discord.js';
import { play } from '../utils/play.js';
import { youtubeAPIKey } from '../../auth.js';

import YouTubeAPI from 'simple-youtube-api';
const youtube = new YouTubeAPI(youtubeAPIKey);
//import scdl from 'soundcloud-downloader';

import {success} from '../../utils/messages.js';


export default {
    name: 'playlist',
    aliases: ['pl'],
    description: 'Plays music from youtube.',
    pattern: '<Playlist>',
    examples: ['play https://www.youtube.com/playlist?list=PLeisdcBQyGoEoOQvZwBs1m3cbjLJjB62T'],
    guildOnly: true,
    clientPermReqs: 'CONNECT',
    async execute(message, parsed) {
        const { channel } = message.member.voice;
        const serverQueue = message.client.queue.get(message.guild.id);

        if (!channel)
            return message.reply('You need to join a voice channel first!');

        const permissions = channel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT'))
            return message.reply('Cannot connect to voice channel, missing permissions');
        if (!permissions.has('SPEAK'))
            return message.reply('I cannot speak in this voice channel, make sure I have the proper permissions!');

        if (serverQueue && channel !== message.guild.me.voice.channel)
            return message.reply(`You must be in the same channel as ${message.client.user}`);

        const search = parsed.playlist;
        const pattern = /^.*(youtu.be\/|list=)([^#&?]*).*/gi;

        const url = search.split(/ +/g)[0];
        const urlValid = pattern.test(url);

        const queueConstruct = {
            textChannel: message.channel,
            channel,
            connection: null,
            songs: [],
            loop: false,
            volume: 100,
            playing: true
        };

        let playlist = null;
        let videos = [];

        if (urlValid) {
            playlist = await youtube.getPlaylist(url, { part: 'snippet' });
            videos = await playlist.getVideos(undefined, { part: 'snippet' });
        /*
        } else if (scdl.isValidUrl(args[0])) {
            if (args[0].includes('/sets/')) {
                message.channel.send(i18n.__('playlist.fetchingPlaylist'));
                playlist = await scdl.getSetInfo(args[0], SOUNDCLOUD_CLIENT_ID);
                videos = playlist.tracks.map((track) => ({
                    title: track.title,
                    url: track.permalink_url,
                    duration: track.duration / 1000
                }));
            }
        */
        } else {
            const results = await youtube.searchPlaylists(search, 1, { part: 'snippet' });
            playlist = results[0];
            videos = await playlist.getVideos(undefined, { part: 'snippet' });
        }

        const newSongs = videos
            .filter((video) => video.title !== 'Private video' && video.title !== 'Deleted video')
            .map((video) => {
                return {
                    title: video.title,
                    url: video.url,
                    duration: video.durationSeconds,
                    queuedBy: message.author
                };
            });

        serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);

        let playlistEmbed = new MessageEmbed()
            .setTitle(`${playlist.title}`)
            .setDescription(newSongs.map((song, index) => `${index + 1}. ${song.title}`))
            .setURL(playlist.url)
            .setColor('#F8AA2A')
            .setTimestamp();

        if (playlistEmbed.description.length >= 2048)
            playlistEmbed.description =
                playlistEmbed.description.substr(0, 2007) + '';

        message.channel.send(playlistEmbed);

        if (!serverQueue) {
            message.client.queue.set(message.guild.id, queueConstruct);

            try {
                queueConstruct.connection = await channel.join();
                await queueConstruct.connection.voice.setSelfDeaf(true);
                await play(queueConstruct.songs[0], message);
            } catch (error) {
                message.client.queue.delete(message.guild.id);
                await channel.leave();
                throw error;
            }
        }
    }
};