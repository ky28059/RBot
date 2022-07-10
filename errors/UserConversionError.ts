import ArgumentConversionError from './ArgumentConversionError';


// Thrown when field requiring a `User` receives a value not resolvable to `User`.
export default class UserConversionError extends ArgumentConversionError {
    constructor (commandName: string, field: string, repeating?: boolean) {
        super(commandName, field, 'User', repeating);
        this.name = 'USER_CONVERSION_ERROR';
    }
}
