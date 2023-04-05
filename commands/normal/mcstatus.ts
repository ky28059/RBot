import {createSlashCommand} from '../../util/commands';
import {AttachmentBuilder, escapeMarkdown} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import fetch from 'node-fetch';

// Utilities
import {author, reply, replyEmbed} from '../../util/messageUtils';
import {requestedBy, success} from '../../util/messages';


export const data = new SlashCommandBuilder()
    .setName('server')
    .setDescription('Gets info about the specified Minecraft server.')
    .addStringOption(option => option
        .setName('serverip')
        .setDescription('The IP of the server to fetch.')
        .setRequired(true))

export default createSlashCommand<{serverip: string}>({
    data,
    async execute(message, parsed) {
        const server = parsed.serverip;
        const res = await (await fetch(`https://api.mcsrvstat.us/2/${server}`)).json();

        // TODO: see todo in `define.ts`; using success embeds for errors is a bit weird
        if (!res.online)
            return replyEmbed(message, success().setAuthor({name: 'Server not found.'}))

        let attachment;

        const serverEmbed = requestedBy(author(message))
            .setTitle(server)
            .setDescription(res.motd.clean.join('\n'))
            .addFields(
                {name: 'Players:', value: `${res.players.online} / ${res.players.max}`, inline: true},
                {name: 'Version:', value: res.version, inline: true}
            );

        if (res.icon) {
            // Convert data URI into image stream
            const imageStream = Buffer.from(res.icon.split(',')[1], 'base64');
            attachment = new AttachmentBuilder(imageStream, {name: 'icon.png'});
            serverEmbed.setThumbnail('attachment://icon.png');
        }
        if (res.players.list)
            serverEmbed.addFields({name: 'Player List:', value: escapeMarkdown(res.players.list.join(', '))});

        await reply(message, {files: attachment && [attachment], embeds: [serverEmbed]});
    }
});
