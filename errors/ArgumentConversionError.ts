import IllegalArgumentError from './IllegalArgumentError';


// Thrown when an argument is an invalid type.
export default class ArgumentConversionError extends IllegalArgumentError {
    constructor (commandName: string, field: string, type: string, repeating?: boolean) {
        super(commandName, repeating
            ? `All arguments to field \`${field}\` must be valid \`${type}\`s.`
            : `Field \`${field}\` must be a valid \`${type}\`.`
        );
        this.name = 'ARGUMENT_CONVERSION_ERROR';
    }
}
