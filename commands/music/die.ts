import { canModifyQueue } from "../utils/canModifyQueue";
import {die} from '../../utils/messages';

import QueueNonexistentError from '../../errors/QueueNonexistentError';
import {Message} from "discord.js";
import {RBot} from '../../bot';


export default {
    name: 'die',
    aliases: ['leave', 'dc'],
    description: 'Kills the music.',
    examples: 'die',
    guildOnly: true,
    async execute(message: Message, parsed: {}, client: RBot) {
        const subscription = client.subscriptions.get(message.guild!.id);

        if (!subscription) throw new QueueNonexistentError(this.name);
        if (!canModifyQueue(message.member!)) return;

        subscription.voiceConnection.destroy();
        client.subscriptions.delete(message.guild!.id);

        await message.reply({embeds: [die()]});
    }
};
