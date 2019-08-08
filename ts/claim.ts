import { Bundle } from "./bundle-manifest";

/**
 * A record of a CNAB installation.
 *
 * Do not JSON.parse claim text and assign it directly to a Claim. Instead, use
 * Claim.parse; this performs extra parsing of fields within the structure.
 */
export interface Claim {
    /**
     * The definition of the bundle that was installed.
     */
    readonly bundle: Bundle;
    /**
     * The time at which the installation record was created.
     */
    readonly createdTime: Date;
    /**
     * Tool-specific data associated with the installation.
     */
    readonly custom?: any;
    /**
     * The time at which the installation record was last changed.
     */
    readonly modifiedTime: Date;
    /**
     * The name of the installation.
     */
    readonly name: string;
    /**
     * The outputs of the last action on this installation.
     */
    readonly outputs?: { [key: string]: string };
    /**
     * The resolved parameters used during the last action.
     */
    readonly parameters?: { [key: string]: any };
    /**
     * The result of the last action on this installation.
     */
    readonly result?: ActionResult;
    /**
     * A unique identifier that changes each time the installation is modified.
     */
    readonly revision: string;
}

/**
 * The result of a CNAB action such as installation or upgrading.
 */
export interface ActionResult {
    /**
     * The name of the action that this is the result of.
     */
    readonly action: string;
    /**
     * A human readable message describing the outcome of the action.
     */
    readonly message: string;
    /**
     * The last known status of the action.
     */
    readonly status: 'failure' | 'underway' | 'unknown' | 'success';
}

export namespace Claim {
    /**
     * Parses a claim from JSON.
     * @param jsonText The JSON formatted text of the claim.
     * @returns A Claim object representing the claim.
     */
    export function parse(jsonText: string): Claim {
        const claim = JSON.parse(jsonText);
        claim.createdTime = new Date(claim.created);
        claim.modifiedTime = new Date(claim.modified);
        return claim;
    }
}
