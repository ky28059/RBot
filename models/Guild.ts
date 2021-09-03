// Represents a Guild Presets object in the SQL database
// This contains presets data, like custom prefix, disabled commands, censorship, etc.

import {Model, DataTypes, Sequelize, Optional} from 'sequelize';


interface GuildAttributes {
    guildID: string;
    prefix: string;
    logchannel: string;

    disabled_commands: string;
    censored_users: string;
    censored_words: string;
    blacklist: string;
    autoroles: string;

    log_message_delete: boolean;
    log_message_delete_bulk: boolean;
    log_message_edit: boolean;
    log_member_join: boolean;
    log_member_leave: boolean;
    log_nickname_change: boolean;
}

interface GuildCreationAttributes extends Optional<GuildAttributes,
    'prefix' | 'logchannel' | 'disabled_commands' | 'censored_users' | 'censored_words' | 'blacklist' | 'autoroles' |
    'log_message_delete' | 'log_message_delete_bulk' | 'log_message_edit' | 'log_member_join' | 'log_member_leave' | 'log_nickname_change'> {}

export class Guild extends Model<GuildAttributes, GuildCreationAttributes> implements GuildAttributes {
    public guildID!: string;
    public prefix!: string;
    public logchannel!: string;

    public disabled_commands!: string;
    public censored_users!: string;
    public censored_words!: string;
    public blacklist!: string;
    public autoroles!: string;

    public log_message_delete!: boolean;
    public log_message_delete_bulk!: boolean;
    public log_message_edit!: boolean;
    public log_member_join!: boolean;
    public log_member_leave!: boolean;
    public log_nickname_change!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
    return Guild.init({
        guildID: {
            type: DataTypes.STRING,
            unique: true,
        },
        prefix: {
            type: DataTypes.STRING,
            defaultValue: '!',
        },
        logchannel: {
            type: DataTypes.STRING,
            defaultValue: '',
        },

        disabled_commands: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        censored_users: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        censored_words: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        blacklist: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        autoroles: {
            type: DataTypes.STRING,
            defaultValue: '',
        },

        // Logging
        log_message_delete: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        log_message_delete_bulk: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        log_message_edit: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        log_member_join: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        log_member_leave: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        log_nickname_change: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {sequelize})
}
