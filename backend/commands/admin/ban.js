import {log} from "../utils/logger.js";

// Errors
import MissingArgumentError from '../../errors/MissingArgumentError.js';
import IllegalArgumentError from '../../errors/IllegalArgumentError.js';


export default {
    name: 'ban',
    description: 'Ban a user from this server.',
    usage: 'ban @[user] [reason]',
    examples: 'ban @example NSFW imagery',
    guildOnly: true,
    permReqs: 'BAN_MEMBERS',
    clientPermReqs: 'BAN_MEMBERS',
    async execute(message, parsed, client, tag) { // target = GuildMember
        const guild = message.guild;
        const memberTarget = parsed.memberTarget;

        if (!memberTarget)
            throw new MissingArgumentError(this.name, 'Target');
        if (memberTarget.user.id === message.author.id)
            throw new IllegalArgumentError(this.name, '`Target` cannot be yourself');
        if (!memberTarget.bannable)
            return message.reply("I cannot ban this user!");

        let reason = parsed.joined;
        if (!reason) reason = "No reason provided";

        await memberTarget.ban(reason);

        await log(client, guild, tag, 0x7f0000, memberTarget.user.tag, memberTarget.user.avatarURL(), `**${memberTarget.user} has been banned by ${message.author} for the reason:**\n${reason}`);
        await message.react('👌');
    }
}
