import {MessageEmbed} from 'discord.js'


const errEmbed = new MessageEmbed()
    .setColor(0xb50300)
    .setFooter(new Date());

const successEmbed = new MessageEmbed()
    .setColor(0xf6b40c)


// General purpose error embed
export function err(title, desc) {
    const embed = new MessageEmbed(errEmbed);

    if (desc) embed.setDescription(desc);
    if (title) embed.setAuthor(title, 'https://cdn.discordapp.com/avatars/684587440777986090/04d8e01393c7e0743c20fc87c351966d.webp');

    return embed;
}

// General purpose success embed
export function success({title, desc}) {
    const embed = new MessageEmbed(successEmbed);

    if (desc) embed.setDescription(desc);
    if (title) embed.setAuthor(title);

    return embed;
}


// The Now Playing embed for music commands
export function nowPlaying(song) {
    return success({title: 'Now playing:', desc: `[${song.title}](${song.url}) [${song.queuedBy}]`});
}

// The Loop embed for music commands
export function loop(looped) {
    return success({desc: `Loop set to ${looped ? "**on**" : "**off**"}`});
}

// The Skip embed for music commands
export function skip() {
    return success({desc: `⏭ Skipped the song`});
}

// The Shuffle embed for music commands
export function shuffle() {
    return success({desc: `🔀 Shuffled the queue`});
}

// The Die embed for music commands
export function die() {
    return success({desc: `⏹ Music queue ended`});
}