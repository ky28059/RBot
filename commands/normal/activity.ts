import {createGuildOnlySlashCommand} from '../../utils/commands';
import {Channel, ChannelType, GuildPremiumTier, InviteTargetType, Snowflake} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {reply} from '../../utils/messageUtils';
import PremiumTierRequiredError from '../../errors/PremiumTierRequiredError';
import IllegalArgumentError from '../../errors/IllegalArgumentError';


type Activity = {id: Snowflake, name: string, boostLevel: number}
const activities: Activity[] = [
    {id: '880218394199220334', name: 'Watch Together', boostLevel: 0},
    {id: '755827207812677713', name: 'Poker Night', boostLevel: 1},
    {id: '773336526917861400', name: 'Betrayal.io', boostLevel: 0},
    {id: '814288819477020702', name: 'Fishington.io', boostLevel: 0},
    {id: '832012774040141894', name: 'Chess In The Park', boostLevel: 1},
    {id: '879864070101172255', name: 'Sketchy Artist', boostLevel: 0},
    {id: '879863881349087252', name: 'Awkword', boostLevel: 0},
    {id: '878067389634314250', name: 'Doodle Crew', boostLevel: 0},
    {id: '902271654783242291', name: 'Sketch Heads', boostLevel: 0},
    {id: '879863686565621790', name: 'Letter League', boostLevel: 1},
    {id: '879863976006127627', name: 'Word Snacks', boostLevel: 0},
    {id: '852509694341283871', name: 'SpellCast', boostLevel: 1},
    {id: '832013003968348200', name: 'Checkers In The Park', boostLevel: 1},
    {id: '832025144389533716', name: 'Blazing 8s', boostLevel: 1},
    {id: '945737671223947305', name: 'Putt Party', boostLevel: 1},
    {id: '903769130790969345', name: 'Land-io', boostLevel: 1},
    {id: '947957217959759964', name: 'Bobble League', boostLevel: 1},
    {id: '976052223358406656', name: 'Ask Away', boostLevel: 1},
    {id: '950505761862189096', name: 'Know What I Meme', boostLevel: 1}
];

export const data = new SlashCommandBuilder()
    .setName('activity')
    .setDescription('Starts an activity in the provided voice channel!')
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('The voice channel to start the activity in.')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true))
    .addStringOption(option => option
        .setName('activity')
        .setDescription('The activity to start.')
        .addChoices(...activities.map(a => ({name: a.name + (a.boostLevel ? ` (requires level ${a.boostLevel})` : ''), value: a.id})))
        .setRequired(true))

export default createGuildOnlySlashCommand<{channel: Channel, activity: string}>({
    data,
    async execute(message, parsed) {
        const tier = message.guild!.premiumTier;

        if (parsed.channel.type !== ChannelType.GuildVoice)
            throw new IllegalArgumentError(data.name, `${parsed.channel} is not a voice channel.`);

        const activity = activities.find((a) => a.id === parsed.activity);
        if (!activity)
            throw new IllegalArgumentError(data.name, `\`${parsed.activity}\` is not a valid activity.`);

        if (tier === GuildPremiumTier.None && activity.boostLevel > 0)
            throw new PremiumTierRequiredError(data.name, activity.boostLevel);
        if (tier === GuildPremiumTier.Tier1 && activity.boostLevel > 1)
            throw new PremiumTierRequiredError(data.name, activity.boostLevel);
        if (tier === GuildPremiumTier.Tier2 && activity.boostLevel > 2)
            throw new PremiumTierRequiredError(data.name, activity.boostLevel);

        const invite = await parsed.channel.createInvite({
            targetType: InviteTargetType.EmbeddedApplication,
            targetApplication: activity.id
        });

        await reply(message, invite.url);
    }
});
