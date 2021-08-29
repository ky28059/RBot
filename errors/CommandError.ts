// Represents an error thrown in a command
export default class CommandError extends Error {
    command: string;

    constructor (commandName: string, message: string) {
        super(message);

        this.name = 'COMMAND_ERROR';
        this.command = commandName;
    }
}
