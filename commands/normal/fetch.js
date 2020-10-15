import fetch from 'node-fetch';
import {parse} from '../utils/stringParser.js';
import {truncateMessage} from '../utils/messageTruncator.js';

export default {
    name: 'fetch',
    aliases: ['grab'],
    description: 'Fetch plaintext HTML from a website link.',
    usage: 'fetch [website]',
    async execute(message, parsed) {
        const url = parsed.first;
        if (!url) return message.reply('you must specify an IP to get the status of!');

        let source = '[Error: no source found]';
        await fetch(url)
            .then(res => res.text())
            .then(body => source = body)
            .catch(error => message.reply(`error fetching website: ${error}`));

        message.channel.send(`Fetched:\`\`\`html\n${truncateMessage(source, 19)}\`\`\``);
    }
}