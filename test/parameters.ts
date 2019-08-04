import 'mocha';
import assert from 'assert';

import * as cnab from '../ts/index';
import { Parameters } from '../ts/index';

const TEST_BUNDLE: cnab.Bundle = {
    name: 'test',
    schemaVersion: 'v1',
    version: '1.0.0',
    invocationImages: [],

    definitions: {
        sample: { type: 'string' }
    },

    parameters: {
        noApplyTo: { definition: 'sample', destination: {} },
        emptyApplyTo: { applyTo: [], definition: 'sample', destination: { } },
        applyTo2: { applyTo: ['install', 'update'], definition: 'sample', destination: { } },
    },
};

describe('a parameter with no applyTo', () => {

    it('should apply to everything', () => {
        const parameters = Parameters.forAction(TEST_BUNDLE, 'install');
        assert(parameters.includes('noApplyTo'), 'expected noApplyTo to be an install parameter');
    });

});

describe('a parameter with empty applyTo', () => {

    it('should apply to everything', () => {
        const parameters = Parameters.forAction(TEST_BUNDLE, 'install');
        assert(parameters.includes('emptyApplyTo'), 'expected emptyApplyTo to be an install parameter');
    });

});

describe('a parameter with populated applyTo', () => {

    it('should apply to the actions it names', () => {
        const parametersI = Parameters.forAction(TEST_BUNDLE, 'install');
        assert(parametersI.includes('applyTo2'), 'expected applyTo2 to be an install parameter');
        const parametersU = Parameters.forAction(TEST_BUNDLE, 'update');
        assert(parametersU.includes('applyTo2'), 'expected applyTo2 to be an update parameter');
    });

    it('should not apply to actions it does not name', () => {
        const parameters = Parameters.forAction(TEST_BUNDLE, 'uninstall');
        assert(!parameters.includes('applyTo2'), 'expected applyTo2 NOT to be an uninstall parameter but it was');
    });
});
