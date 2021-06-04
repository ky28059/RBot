import {Command} from '../../types/Command';
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

        const players = source.match(/<td>Players<\/td>\s+(.+)(?: - <a href="#" id="show_players")|(?:<\/td>)/)?.[1] ?? 'Not found';
        const version = source.match(/<td>Version<\/td>\s+(.+)<\/td>/)?.[1] ?? 'Not found';

        const serverEmbed = new MessageEmbed()
            .setColor(0x333333)
            .setAuthor(server)
            .setDescription(`**Players:** ${players}\n**Version:** ${version}`)
            .setFooter(`Requested by ${message.author.tag}`);
        await message.channel.send(serverEmbed);
    }
} as Command;
