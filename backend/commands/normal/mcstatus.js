import {MessageEmbed} from 'discord.js';
import fetch from 'node-fetch';


export default {
    name: 'mcstatus',
    aliases: ['status'],
    description: 'Gets server info of the specified Minecraft server.',
    pattern: '[ServerIP]',
    examples: 'mcstatus hypixel.net',
    async execute(message, parsed) {
        const server = parsed.serverip;
        const res = await (await fetch(`https://api.mcsrvstat.us/2/${server}`)).json();

        const serverEmbed = new MessageEmbed()
            .setColor(0x333333);

        if (!res.online) {
            serverEmbed.setAuthor('Server not found.');
        } else {
            serverEmbed
                .setAuthor(server)
                .setDescription(res.motd.clean.join('\n'))
                .addField('Players:', `${res.players.online} / ${res.players.max}`, true)
                .addField('Version:', res.version, true)
                .setFooter(`Requested by ${message.author.tag}`);

            if (res.players.list) serverEmbed.addField('Player List:', res.players.list.join(', '));
        }

        message.channel.send(serverEmbed);
    }
}
