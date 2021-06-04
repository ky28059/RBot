import IllegalArgumentError from './IllegalArgumentError';


// Thrown when a number argument is not within its allowed range
export default class IntegerRangeError extends IllegalArgumentError {
    constructor (commandName: string, field: string, lowerBound?: number | string, upperBound?: number | string) {
        let message;

        if (lowerBound !== undefined && upperBound !== undefined)
            message = `Field \`${field}\` must be between ${lowerBound} and ${upperBound}`;
        else if (lowerBound !== undefined)
            message = `Field \`${field}\` must be above ${lowerBound}`;
        else
            message = `Field \`${field}\` must be below ${upperBound}`;

        super(commandName, message);
        this.name = 'RANGE_ERROR';
    }
}
