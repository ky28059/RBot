import {MessageEmbed} from 'discord.js';
import fetch from 'node-fetch';
import {parse} from '../utils/stringParser.js';

export default {
  name: 'mcstatus',
  async execute(message, args) {
    const server = args[0];
    if (!server) return message.reply('you must specify an IP to get the status of!');

    let source = '';
    await fetch(`https://mcsrvstat.us/server/${server}`)
        .then(res => res.text())
        .then(body => source = body)
        .catch(error => console.error(error));

    const players = parse(source, '<td>Players</td>\n			<td>', ' - <a href="#" id="show_players"') || parse(source, '<td>Players</td>\n			<td>', '</td>', 0);
    const version = parse(source, '<td>Version</td>\n			<td>', '</td>', 0);

    const serverEmbed = new MessageEmbed()
        .setColor(0x333333)
        .setAuthor(server)
        .setDescription(`**Players:** ${players}\n**Version:** ${version}`)
        .setFooter(`Requested by ${message.author.tag}`);
    message.channel.send(serverEmbed);
  }
}
