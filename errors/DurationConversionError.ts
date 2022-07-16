import ArgumentConversionError from './ArgumentConversionError';


// Thrown when field requiring a `Channel` receives a value not resolvable to `Channel`.
export default class DurationConversionError extends ArgumentConversionError {
    constructor (commandName: string, field: string, repeating?: boolean) {
        super(commandName, field, 'duration', repeating);
        this.name = 'DURATION_CONVERSION_ERROR';
    }
}
