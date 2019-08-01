import 'mocha';
import assert from 'assert';

import * as cnab from '../ts/index';
import { Validator, Validity } from '../ts/index';

const TEST_BUNDLE: cnab.Bundle = {
    name: 'test',
    schemaVersion: 'v1',
    version: '1.0.0',
    invocationImages: [],

    definitions: {
        simpleString: { type: 'string' },
    },

    parameters: {
        simpleString: { definition: 'simpleString', destination: {} },
    },
};

const TEST_VALIDATOR = Validator.for(TEST_BUNDLE);

function expectValid(validity: Validity) {
    if (!validity.isValid) {
        assert.fail(`should have been valid but '${validity.reason}'`);
    }
}

function expectInvalid(validity: Validity) {
    if (validity.isValid) {
        assert.fail(`should NOT have been valid`);
    }
}

describe('a string parameter', () => {

    it('should accept a string value', () => {
        const validity = TEST_VALIDATOR.validate('simpleString', 'some text');
        expectValid(validity);
    });

    it('should not accept a numeric value', () => {
        const validity = TEST_VALIDATOR.validate('simpleString', 123);
        expectInvalid(validity);
    });

});
