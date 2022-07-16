import ArgumentConversionError from './ArgumentConversionError';


// Thrown when field requiring a `duration` receives a value not resolvable to `duration`.
// TODO: add a field to `ArgumentConversionError` allowing more detailed error messages? It may be useful explaining
// what exactly is resolvable to `duration` seeing as it is not as straightforward as a user ping.
export default class DurationConversionError extends ArgumentConversionError {
    constructor (commandName: string, field: string, repeating?: boolean) {
        super(commandName, field, 'duration', repeating);
        this.name = 'DURATION_CONVERSION_ERROR';
    }
}
