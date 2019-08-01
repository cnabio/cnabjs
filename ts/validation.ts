import { Bundle } from "./bundle-manifest";
import * as ajv from 'ajv';

export interface Valid {
    readonly isValid: true;
}

export interface Invalid {
    readonly isValid: false;
    readonly reason: string;
}

export type Validity = Valid | Invalid;

export interface BundleParameterValidator {
    validate(parameter: string, value: string | number | boolean): Validity;
    validateText(parameter: string, valueText: string): Validity;
}

export class Validator implements BundleParameterValidator {
    static for(bundle: Bundle): BundleParameterValidator {
        return new Validator(bundle);
    }

    constructor(private readonly bundle: Bundle) { }

    validate(parameter: string, value: string | number | boolean): Validity {
        const schema = this.parameterSchema(parameter);
        if (!schema) {
            return { isValid: false, reason: 'Bundle does not specify valid parameter values' };  // TODO: more precise error message
        }

        const validator = ajv.default();
        const validate = validator.compile(schema);
        const isValid = !!(validate(value));  // We are never async so we can just breeze past the PromiseLike return
        if (isValid) {
            return { isValid: true };
        }

        const reason = validate.errors!.map((err) => err.message).join(', ');
        return { isValid: false, reason: reason };
    }

    validateText(parameter: string, valueText: string): Validity {
        // TODO: type coercion
        return this.validate(parameter, valueText);
    }

    private parameterSchema(parameter: string) {
        if (!this.bundle.parameters || !this.bundle.definitions) {
            return undefined;
        }
        const parameterInfo = this.bundle.parameters[parameter];
        if (!parameterInfo) {
            return undefined;
        }
        const definition = this.bundle.definitions[parameterInfo.definition];
        return definition;
    }
}
