const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');
const {parse}  = require('../utils/stringParser.js');
const { Command } = require('discord.js-commando');

module.exports =  class MCStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'mcstatus',
      memberName: 'mcstatus',
      group: 'normal',
      description: 'Gets the server status (player count and version requirement) of the specified Minecraft server.',
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
