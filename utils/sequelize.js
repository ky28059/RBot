import Sequelize from 'sequelize';

export function load() {
    const sequelize = new Sequelize('database', 'user', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: 'database.sqlite',
    });

    return sequelize.define('tags', {
        guildID: {
            type: Sequelize.STRING,
            unique: true,
        },
        prefix: {
            type: Sequelize.STRING,
            defaultValue: '!',
        },
        logchannel: {
            type: Sequelize.STRING,
            defaultValue: '',
        },

        disabled_commands: {
            type: Sequelize.STRING,
            defaultValue: '',
        },
        censored_users: {
            type: Sequelize.STRING,
            defaultValue: '',
        },
        blacklist: {
            type: Sequelize.STRING,
            defaultValue: '',
        },
        autoroles: {
            type: Sequelize.STRING,
            defaultValue: '',
        },

        // Logging
        log_message_delete: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        log_message_delete_bulk: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        log_message_edit: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        log_member_join: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        log_member_leave: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        log_nickname_change: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
    });
}
