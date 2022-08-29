import {EmbedBuilder, User} from 'discord.js'
import {Track} from './track';


// General purpose error embed.
export function err(title?: string, desc?: string) {
    const embed = new EmbedBuilder()
        .setColor(0xb50300)
        .setFooter({text: new Date().toISOString()});

    if (desc) embed.setDescription(desc);
    if (title) embed.setAuthor({
        name: title,
        iconURL: 'https://cdn.discordapp.com/avatars/684587440777986090/04d8e01393c7e0743c20fc87c351966d.webp'
    });

    return embed;
}

// General purpose success embed.
// TODO: should this support `.setTitle()` as well as `.setAuthor({name})`?
export function success() {
    return new EmbedBuilder()
        .setColor(0xf6b40c);
}

// A success embed with a "Requested by user#0000" footer.
export function requestedBy(user: User) {
    return success()
        .setFooter({text: `Requested by ${user.tag}`})
}


// The `Now playing` embed for music commands.
export function nowPlaying(song: Track) {
    return success()
        .setAuthor({name: 'Now playing:'})
        .setDescription(`[${song.title}](${song.url}) [<@!${song.queuedBy}>]`);
}

// The `Loop` embed for music commands.
export function loop(looped: boolean) {
    return success()
        .setDescription(`Loop set to **${looped ? 'on' : 'off'}**.`);
}

// The `Skip` embed for music commands.
export function skip() {
    return success()
        .setDescription('⏭ Skipped the song.');
}

// The `Pause` embed for music commands.
export function pause() {
    return success()
        .setDescription('⏸ Paused the song.');
}

// The `Unpause` embed for music commands.
export function unpause() {
    return success()
        .setDescription('▶ Unpaused the song.')
}

// The `Shuffle` embed for music commands.
export function shuffle() {
    return success()
        .setDescription('🔀 Shuffled the queue.');
}

// The Die embed for music commands.
export function die() {
    return success()
        .setDescription('⏹ Music queue ended.');
}
