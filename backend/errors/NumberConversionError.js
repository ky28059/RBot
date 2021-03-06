import IllegalArgumentError from './IllegalArgumentError.js';


// Thrown when field requiring a number cannot parse the input into a Number
export default class NumberConversionError extends IllegalArgumentError {
    constructor (commandName, field) {
        super(commandName, `Field \`${field}\` must be a valid number`);
        this.name = 'NUMBER_CONVERSION_ERROR';
    }
}
