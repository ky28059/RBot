import {Client, Collection} from 'discord.js';
import {Command} from './Command';
import {Model, ModelCtor, Sequelize} from "sequelize";
import {GuildInstance} from "../models/Guild";


export default class RBot extends Client {
    ownerID = '355534246439419904'; // For owner only commands

    queue = new Map(); // For music commands

    // Dynamic command handling
    commands = new Collection<string, Command>();
    async loadCommands() {}

    // Sequelize
    GuildTags: ModelCtor<GuildInstance> = ;
}