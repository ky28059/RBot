// Represents a Guild Presets object in the SQL database
// This contains presets data, like custom prefix, disabled commands, censorship, etc.

import sql from 'sequelize';
const {Model, DataTypes} = sql;


class Guild extends Model {}

export default (sequelize) => {
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
