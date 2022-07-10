import ArgumentConversionError from './ArgumentConversionError';


// Thrown when field requiring an integer receives a non int value (non-number or decimal).
export default class IntegerConversionError extends ArgumentConversionError {
    constructor (commandName: string, field: string, repeating?: boolean) {
        super(commandName, field, 'integer', repeating);
        this.name = 'INTEGER_CONVERSION_ERROR';
    }
}
