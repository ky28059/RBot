import {readToken} from '../utils/tokenManager.js';
import {writeFile} from '../../fileManager.js';

export default {
    name: 'set',
    description: 'Set new token data for this server.',
    usage: 'set [field] [value]',
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    async execute(message, parsed) {
        const args = parsed.raw;
        const guild = message.guild;
        const field = args.shift().toLowerCase();
        if (!field) return message.reply('you must specify the token field to modify!');

        const path = `./tokens/${guild.id}.json`;
        const tokenData = await readToken(guild);
        let updated;

        switch (field) {
            case 'logchannel':
                const channelTarget = parsed.channelTarget;
                if (!channelTarget) return message.reply("please mention a valid channel in this server");
                if (!(channelTarget.guild.id === guild.id)) return message.reply('you can only log to your own server!');

                tokenData.logchannel = channelTarget.id;
                updated = channelTarget;
                break;

            case 'prefix':
                const prefix = args.join(" ");
                if (!prefix) return message.reply('you must specify a prefix to set!')

                tokenData.prefix = prefix;
                updated = prefix;
                break;

            default:
                return message.reply('you must specify a valid token field to modify! Valid token fields: `logchannel, prefix`');
        }
        await writeFile(path, JSON.stringify(tokenData));
        message.channel.send(`Success! ${field} has been updated to ${updated}!`);
    }
}
