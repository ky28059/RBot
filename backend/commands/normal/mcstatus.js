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
        const source = await (await fetch(`https://mcsrvstat.us/server/${server}`)).text();

        const players = source.match(/<td>Players<\/td>\s+<td>\s(.+)(?: - <a href="#" id="show_players"|<\/td>)/)?.[1];
        const version = source.match(/<td>Version<\/td>\s+<td>\s(.+)<\/td>/)?.[1];

        const serverEmbed = new MessageEmbed()
            .setColor(0x333333);

        if (!players || !version) serverEmbed
            .setAuthor('Server not found.')
        else serverEmbed
            .setAuthor(server)
            .setDescription(`**Players:** ${players}\n**Version:** ${version}`)
            .setFooter(`Requested by ${message.author.tag}`);

        message.channel.send(serverEmbed);
    }
}
