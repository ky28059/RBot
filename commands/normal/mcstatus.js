import {MessageEmbed} from 'discord.js';
import fetch from 'node-fetch';
import {parse} from '../utils/stringParser.js';

import Command from 'discord.js-commando';

export class MCStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'mcstatus',
      memberName: 'mcstatus',
      group: 'normal',
      description: 'Replies with the text you provide.',
      args: [
        {
          key: 'server',
          prompt: 'Provide an IP for the bot to fetch',
          type: 'string',
        },
      ],
    });
  }

  async run(message, { server }) {
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
    message.say(serverEmbed);
  }
}
