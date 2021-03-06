import IllegalArgumentError from './IllegalArgumentError.js';


// Thrown when field requiring an int receives a non int value
export default class IntegerConversionError extends IllegalArgumentError {
    constructor (commandName, field) {
        super(commandName, `Field \`${field}\` must be a valid integer`);
        this.name = 'INTEGER_CONVERSION_ERROR';
    }
}
