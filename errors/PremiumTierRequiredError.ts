import ActionUntakeableError from './ActionUntakeableError';


// Thrown when a command requiring a certain boost level is invoked in a guild without the level.
export default class PremiumTierRequiredError extends ActionUntakeableError {
    constructor (commandName: string, tier: number) {
        super(commandName, `A level ${tier} server boost is required to perform this action.`);
        this.name = 'PREMIUM_TIER_REQUIRED_ERROR';
    }
}
