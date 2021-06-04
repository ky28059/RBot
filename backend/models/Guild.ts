import {Sequelize, DataTypes, Optional, Model} from 'sequelize';

// Guild presets

interface Guild {
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

// Some fields are optional when calling UserModel.create() or UserModel.build()
interface GuildCreationAttributes extends Optional<Guild,
    'prefix' | 'logchannel' | 'disabled_commands' | 'censored_users' | 'censored_words' | 'blacklist' | 'autoroles' |
    'log_message_delete' | 'log_message_delete_bulk' | 'log_message_edit' | 'log_member_join' | 'log_member_leave' | 'log_nickname_change'> {}

export interface GuildInstance
    extends Model<Guild, GuildCreationAttributes>,
        Guild {}


export default function load(sequelize: Sequelize) {
    return sequelize.define<GuildInstance>('guilds', {
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
    });
}