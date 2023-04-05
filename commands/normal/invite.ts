import {createSlashCommand} from '../../util/commands';
import {OAuth2Scopes, PermissionsBitField} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {replyEmbed} from '../../util/messageUtils';
import {success} from '../../util/messages';


export const data = new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Sends RBot\'s invite link.')

export default createSlashCommand({
    data,
    async execute(message) {
        const link = message.client.generateInvite({
            permissions: [PermissionsBitField.Flags.Administrator],
            scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands]
        });

        const inviteEmbed = success()
            .setAuthor({name: 'Invite link:'})
            .setDescription(`[Click here to invite RBot to another server!](${link})`);

        await replyEmbed(message, inviteEmbed);
    }
});
