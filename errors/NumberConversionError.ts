import ArgumentConversionError from './ArgumentConversionError';


// Thrown when field requiring a `number` receives a value not resolvable to `number`.
export default class NumberConversionError extends ArgumentConversionError {
    constructor (commandName: string, field: string, repeating?: boolean) {
        super(commandName, field, 'number', repeating);
        this.name = 'NUMBER_CONVERSION_ERROR';
    }
}
