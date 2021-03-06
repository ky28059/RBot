import { play } from '../utils/play.js';
import { youtubeAPIKey } from '../../auth.js';

import ytdl from 'ytdl-core';
import YouTubeAPI from 'simple-youtube-api';
const youtube = new YouTubeAPI(youtubeAPIKey);
//import scdl from 'soundcloud-downloader';

import {success} from '../../utils/messages.js';

// Errors
import MemberNotInVCError from '../../errors/MemberNotInVCError.js';
import MusicAlreadyBoundError from '../../errors/MusicAlreadyBoundError.js';


export default {
    name: 'play',
    aliases: ['p'],
    description: 'Plays music from youtube.',
    pattern: '<Video>',
    examples: ['play Never Gonna Give You Up', 'play https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    guildOnly: true,
    clientPermReqs: 'CONNECT',
    async execute(message, parsed) {
        const { channel } = message.member.voice;
        const serverQueue = message.client.queue.get(message.guild.id);

        if (!channel)
            throw new MemberNotInVCError(this.name);

        const permissions = channel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT'))
            return message.reply('Cannot connect to voice channel, missing permissions');
        if (!permissions.has('SPEAK'))
            return message.reply('I cannot speak in this voice channel, make sure I have the proper permissions!');

        if (serverQueue && channel !== message.guild.me.voice.channel)
            throw new MusicAlreadyBoundError(this.name, message.guild.me.voice.channel, channel);

        const video = parsed.video;
        const url = video.split(/ +/g)[0];

        const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
        const playlistPattern = /^.*(list=)([^#&?]*).*/gi;
        //const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/; // TODO: soundcloud

        const urlValid = videoPattern.test(url);

        // Start the playlist if playlist url was provided
        if (!videoPattern.test(url) && playlistPattern.test(url)) {
            return message.client.commands.get('playlist').execute(message, {playlist: url});
        }/* else if (scdl.isValidUrl(url) && url.includes('/sets/')) {
            return message.client.commands.get('playlist').execute(message, args);
        }
        */

        const queueConstruct = {
            textChannel: message.channel,
            channel,
            connection: null,
            songs: [],
            loop: false,
            volume: 100,
            playing: true
        };

        let songInfo = null;
        let song = null;

        if (urlValid) { // If the argument provided was a valid URL
            songInfo = await ytdl.getInfo(url);
            song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                duration: songInfo.videoDetails.lengthSeconds,
                queuedBy: message.author
            };
        /* } else if (scRegex.test(url)) {
            try {
                const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
                song = {
                    title: trackInfo.title,
                    url: trackInfo.permalink_url,
                    duration: Math.ceil(trackInfo.duration / 1000)
                };
            } catch (error) {
                if (error.statusCode === 404)
                    return message.reply('Could not find that Soundcloud track.').catch(console.error);
                return message.reply('There was an error playing that Soundcloud track.').catch(console.error);
            } */
        } else { // Otherwise, search for it
            try {
                const results = await youtube.searchVideos(video, 1);

                songInfo = await ytdl.getInfo(`https://youtube.com/watch?v=${results[0].id}`);
                song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    duration: songInfo.videoDetails.lengthSeconds,
                    queuedBy: message.author
                };
            } catch (error) {
                return message.reply('No video was found with a matching title');
            }
        }

        if (serverQueue) {
            serverQueue.songs.push(song);
            return serverQueue.textChannel.send(success({desc: `**${song.title}** added to queue by ${message.author}`}))
        }

        queueConstruct.songs.push(song);
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
};