// Represents an error thrown in a command
export default class CommandError extends Error {
    constructor (commandName, message) {
        super(message);

        this.name = 'COMMAND_ERROR';
        this.command = commandName;
    }
}
