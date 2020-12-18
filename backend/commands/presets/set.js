import MissingArgumentError from '../../errors/MissingArgumentError.js';
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';

export default {
    name: 'set',
    description: 'Sets new token data for this server.',
    usage: 'set [field] [value]',
    examples: ['set logchannel #logs', 'set prefix r'],
    guildOnly: true,
    permReqs: 'MANAGE_GUILD',
    async execute(message, parsed, client, tag) {
        const args = parsed.raw;
        if (!args.length)
            throw new MissingArgumentError(this.name, 'Field');

        const guild = message.guild;
        const field = args.shift().toLowerCase();

        let updated; // better way of doing this, there is probably

        switch (field) {
            case 'logchannel':
                const channelTarget = parsed.channelTarget;
                if (!channelTarget)
                    throw new MissingArgumentError(this.name, 'Channel');
                if (channelTarget.type !== 'text')
                    throw new IllegalArgumentError(this.name, '`Channel` must be a text channel');
                if (!(channelTarget.guild.id === guild.id))
                    throw new IllegalArgumentError(this.name, '`Channel` must be within this server');

                tag.logchannel = channelTarget.id;
                updated = channelTarget;
                break;

            case 'prefix':
                const prefix = args.join(" ");
                if (!prefix) throw new MissingArgumentError(this.name, 'Prefix')

                tag.prefix = prefix;
                updated = prefix;
                break;

            default:
                throw new IllegalArgumentError(this.name, `${field} not a valid token field; valid token fields: \`logchannel\`, \`prefix\``);
        }
        await tag.save();
        message.channel.send(`Success! ${field} has been updated to ${updated}!`);
    }
}
