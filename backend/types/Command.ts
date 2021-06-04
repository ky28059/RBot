import {Message} from 'discord.js';
import RBot from './RBot';
import {GuildInstance} from '../models/Guild';


export type Command = {
    name: string,
    commandGroup?: string,
    aliases?: string[],
    description: string,
    pattern?: string,
    examples: string | string[],
    guildOnly?: boolean,
    ownerOnly?: boolean,
    permReqs?: string,
    clientPermReqs?: string
    execute: (message: Message, parsed: any, client: RBot, tag: GuildInstance | null) => void
}
