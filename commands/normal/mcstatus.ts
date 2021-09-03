import {CommandInteraction, Message, MessageAttachment, MessageEmbed, Util} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import fetch from 'node-fetch';
import {author, reply} from '../../utils/messageUtils';


export default {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Gets info about the specified Minecraft server.')
        .addStringOption(option =>
            option.setName('serverip')
                .setDescription('The IP of the server to fetch')
                .setRequired(true)),
    async execute(message: Message | CommandInteraction, parsed: {serverip: string}) {
        const server = parsed.serverip;
        // https://api.mcsrvstat.us/
        const res = await (await fetch(`https://api.mcsrvstat.us/2/${server}`)).json();

        const serverEmbed = new MessageEmbed()
            .setColor(0x333333);
        let attachment;

        if (!res.online) {
            serverEmbed.setAuthor('Server not found.');
        } else {
            serverEmbed
                .setTitle(server)
                .setDescription(res.motd.clean.join('\n'))
                .addField('Players:', `${res.players.online} / ${res.players.max}`, true)
                .addField('Version:', res.version, true)
                .setFooter(`Requested by ${author(message).tag}`);

            if (res.icon) {
                // Convert data URI into image stream
                const imageStream = Buffer.from(res.icon.split(",")[1], 'base64');
                attachment = new MessageAttachment(imageStream, 'icon.png');
                serverEmbed.setThumbnail('attachment://icon.png');
            }
            if (res.players.list)
                serverEmbed.addField('Player List:', Util.escapeMarkdown(res.players.list.join(', ')));
        }

        await reply(message, {files: attachment && [attachment], embeds: [serverEmbed]});
    }
}
