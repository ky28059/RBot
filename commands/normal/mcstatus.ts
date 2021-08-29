import {Message, MessageAttachment, MessageEmbed, Util} from 'discord.js';
import fetch from 'node-fetch';


export default {
    name: 'mcstatus',
    aliases: ['server'],
    description: 'Gets server info of the specified Minecraft server.',
    pattern: '[ServerIP]',
    examples: 'mcstatus hypixel.net',
    async execute(message: Message, parsed: {serverip: string}) {
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
                .setFooter(`Requested by ${message.author.tag}`);

            if (res.icon) {
                // Convert data URI into image stream
                const imageStream = Buffer.from(res.icon.split(",")[1], 'base64');
                attachment = new MessageAttachment(imageStream, 'icon.png');
                serverEmbed.setThumbnail('attachment://icon.png');
            }
            if (res.players.list)
                serverEmbed.addField('Player List:', Util.escapeMarkdown(res.players.list.join(', ')));
        }

        message.channel.send({files: attachment && [attachment], embeds: [serverEmbed]});
    }
}
