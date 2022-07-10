// Represents an error thrown in a command.
export default class CommandError extends Error {
    command: string;

    protected constructor (commandName: string, message: string, flag?: string) {
        super(`${flag ? `**[${flag}]:** ` : ''}${message}`);
        this.name = 'COMMAND_ERROR';
        this.command = commandName;
    }
}
