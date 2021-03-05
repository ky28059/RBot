import ytdlDiscord from "ytdl-core-discord";
import { canModifyQueue } from './canModifyQueue.js';
//import scdl from "soundcloud-downloader";

import {nowPlaying, loop, skip, die, success} from '../../utils/messages.js';


export async function play(song, message) {
    const queue = message.client.queue.get(message.guild.id);

    if (!song) {
        queue.channel.leave();
        message.client.queue.delete(message.guild.id);
        return queue.textChannel.send("🚫 Music queue ended.");
    }

    let stream = null;
    let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

    try {
        if (song.url.includes("youtube.com")) {
            stream = await ytdlDiscord(song.url, { highWaterMark: 1 << 25 });
        /* } else if (song.url.includes("soundcloud.com")) {
            try {
                stream = await scdl.downloadFormat(
                    song.url,
                    scdl.FORMATS.OPUS,
                    SOUNDCLOUD_CLIENT_ID ? SOUNDCLOUD_CLIENT_ID : undefined
                );
            } catch (error) {
                stream = await scdl.downloadFormat(
                    song.url,
                    scdl.FORMATS.MP3,
                    SOUNDCLOUD_CLIENT_ID ? SOUNDCLOUD_CLIENT_ID : undefined
                );
                streamType = "unknown";
            } */
        }
    } catch (error) {
        if (queue) {
            queue.songs.shift();
            await play(queue.songs[0], message);
        }

        console.error(error);
        return message.channel.send(`Error: ${error.message ? error.message : error}`);
    }

    queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));

    const dispatcher = queue.connection
        .play(stream, { type: streamType })
        .on("finish", () => {
            if (collector && !collector.ended) collector.stop();

            if (queue.loop) {
                // if loop is on, push the song back at the end of the queue
                // so it can repeat endlessly
                let lastSong = queue.songs.shift();
                queue.songs.push(lastSong);
                play(queue.songs[0], message);
            } else {
                // Recursively play the next song
                queue.songs.shift();
                play(queue.songs[0], message);
            }
        })
        .on("error", (err) => {
            console.error(err);
            queue.songs.shift();
            play(queue.songs[0], message);
        });
    dispatcher.setVolumeLogarithmic(queue.volume / 100);

    const playingMessage = await queue.textChannel.send(nowPlaying(song));
    await playingMessage.react("⏭");
    await playingMessage.react("⏯");
    await playingMessage.react("🔇");
    await playingMessage.react("🔉");
    await playingMessage.react("🔊");
    await playingMessage.react("🔁");
    await playingMessage.react("⏹");

    const filter = (reaction, user) => user.id !== message.client.user.id;
    const collector = playingMessage.createReactionCollector(filter, {
        time: song.duration > 0 ? song.duration * 1000 : 600000
    });

    collector.on("collect", (reaction, user) => {
        if (!queue) return;
        const member = message.guild.member(user);

        switch (reaction.emoji.name) {
            case "⏭":
                queue.playing = true;
                reaction.users.remove(user);
                if (!canModifyQueue(member)) return;
                queue.connection.dispatcher.end();
                queue.textChannel.send(skip());
                collector.stop();
                break;

            case "⏯":
                reaction.users.remove(user);
                if (!canModifyQueue(member)) return;
                if (queue.playing) {
                    queue.playing = !queue.playing;
                    queue.connection.dispatcher.pause(true);
                    queue.textChannel.send(`${user} ⏸ paused the music.`);
                } else {
                    queue.playing = !queue.playing;
                    queue.connection.dispatcher.resume();
                    queue.textChannel.send(`${user} ▶ resumed the music!`);
                }
                break;

            case "🔇":
                reaction.users.remove(user);
                if (!canModifyQueue(member)) return;
                if (queue.volume <= 0) {
                    queue.volume = 100;
                    queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
                    queue.textChannel.send(`${user} 🔊 unmuted the music!`);
                } else {
                    queue.volume = 0;
                    queue.connection.dispatcher.setVolumeLogarithmic(0);
                    queue.textChannel.send(`${user} 🔇 muted the music!`);
                }
                break;

            case "🔉":
                reaction.users.remove(user);
                if (!canModifyQueue(member)) return;
                if (queue.volume - 10 <= 0) queue.volume = 0;
                else queue.volume = queue.volume - 10;
                queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                queue.textChannel.send(`${user} 🔉 decreased the volume, the volume is now ${queue.volume}%`);
                break;

            case "🔊":
                reaction.users.remove(user);
                if (!canModifyQueue(member)) return;
                if (queue.volume + 10 >= 100) queue.volume = 100;
                else queue.volume = queue.volume + 10;
                queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                queue.textChannel.send(`${user} 🔊 increased the volume, the volume is now ${queue.volume}%`);
                break;

            case "🔁":
                reaction.users.remove(user);
                if (!canModifyQueue(member)) return;
                queue.loop = !queue.loop;
                queue.textChannel.send(loop(queue.loop));
                break;

            case "⏹":
                reaction.users.remove(user);
                if (!canModifyQueue(member)) return;
                queue.songs = [];
                queue.textChannel.send(die());
                try {
                    queue.connection.dispatcher.end();
                } catch (error) {
                    queue.connection.disconnect();
                }
                collector.stop();
                break;

            default:
                reaction.users.remove(user);
                break;
        }
    });

    collector.on("end", () => {
        playingMessage.reactions.removeAll();
        /*
        if (PRUNING && playingMessage && !playingMessage.deleted) {
            playingMessage.delete({ timeout: 3000 });
        }
        */
    });
}