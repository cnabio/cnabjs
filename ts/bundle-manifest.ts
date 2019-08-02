/**
 * A CNAB (Cloud Native Application Bundle) manifest.
 */
export interface Bundle {
    /**
     * Custom actions that can be triggered on this bundle.
     */
    actions?: { [key: string]: Action };
    /**
     * Credentials to be injected into the invocation images.
     */
    credentials?: { [key: string]: Credential };
    /**
     * Extension-defined data.
     */
    custom?: { [key: string]: any };
    /**
     * Schemas for parameters.
     */
    definitions?: { [key: string]: Definition };
    /**
     * A human-readable description of the bundle.
     */
    description?: string;
    /**
     * Images that are used by the bundle.
     */
    images?: { [key: string]: Image };
    /**
     * Invocation images for the bundle.
     */
    invocationImages: InvocationImage[];
    /**
     * Keywords describing the bundle.
     */
    keywords?: string[];
    /**
     * The SPDX licence code or proprietary licence name for the bundle.
     */
    license?: string;
    /**
     * The parties responsible for the bundle.
     */
    maintainers?: Maintainer[];
    /**
     * The name of the bundle.
     */
    name: string;
    /**
     * Values that are produced by executing the invocation images.
     */
    outputs?: { [key: string]: Output };
    /**
     * Parameters that can be injected into the invocation images.
     */
    parameters?: { [key: string]: Parameter };
    /**
     * Extensions that a tool must support in order to execute the bundle.
     */
    requiredExtensions?: string[];
    /**
     * The version of the CNAB specification.
     */
    schemaVersion: 'v1';
    /**
     * The version of the bundle. This should conform to SemVer2.
     */
    version: string;
}

/**
 * A custom action that can be triggered on a bundle.
 */
export interface Action {
    /**
     * A human-readable description of the action.
     */
    description?: string;
    /**
     * Whether the action changes any resource managed by the bundle.
     */
    modifies?: boolean;
    /**
     * Indicates that the action is purely informational.
     */
    stateless?: boolean;
}

/**
 * A credential whose value is used when executing the invocation image.
 */
export interface Credential {
    /**
     * A human-readable description of the credential.
     */
    description?: string;
    /**
     * The environment variable through which to surface the credential value in the running invocation image.
     */
    env?: string;
    /**
     * The file path at which to mount the credential value in the running invocation image.
     */
    path?: string;
    /**
     * Whether the credential is required.
     */
    required?: boolean;
}

// We're not in the business of trying to capture the whole of JSON Schema,
// but it's useful to surface bits of it for tooling.
/**
 * The schema of a value (output or parameter). This will be a JSON Schema and
 * can contain the full range of JSON Schema options; the Definition interface
 * restricts itself to key information for common tooling scenarios.
 */
export interface Definition {
    /**
     * The underlying data type of the value.
     */
    type?: 'number' | 'integer' | 'string' | 'boolean';  // TODO: what does CNAB expect us to support?
    /**
     * The default value.
     */
    default?: any;
    /**
     * The permitted values of the value.
     */
    enum?: any[];
    /**
     * Property bag to prevent object literal errors in TypeScript.
     */
    [key: string]: any;
}

/**
 * An application image used in a bundle.
 */
export interface Image {
    /**
     * A digest which can be used to validate the image. The interpretation
     * of the digest depends on the imageType.
     */
    contentDigest?: string;
    /**
     * A human-readable description of the image.
     */
    description?: string;
    /**
     * A resolvable reference to the image, such as an OCI image reference. The interpretation
     * of the reference depends on the imageType.
     */
    image: string;
    /**
     * The type of image. If not present, this should be treated as 'oci'.
     */
    imageType?: string;
    /**
     * Key-value pairs specifying identifying attributes of images.
     */
    labels?: { [key: string]: string };
    /**
     * The media type of the image.
     */
    mediaType?: string;
    /**
     * The size of the image in bytes.
     */
    size?: number;
}

/**
 * An image that is executed to perform a bundle action such as installation.
 */
export interface InvocationImage {
    /**
     * A digest which can be used to validate the image. The interpretation
     * of the digest depends on the imageType.
     */
    contentDigest?: string;
    /**
     * A resolvable reference to the image, such as an OCI image reference. The interpretation
     * of the reference depends on the imageType.
     */
    image: string;
    /**
     * The type of image. If not present, this should be treated as 'oci'.
     */
    imageType?: string;
    /**
     * Key-value pairs specifying identifying attributes of images.
     */
    labels?: { [key: string]: string };
    /**
     * The media type of the image.
     */
    mediaType?: string;
    /**
     * The size of the image in bytes.
     */
    size?: number;
}

/**
 * A party responsible for a bundle.
 */
export interface Maintainer {
    /**
     * The maintainer's email address.
     */
    email?: string;
    /**
     * The maintainer's name.
     */
    name: string;
    /**
     * The maintainer's URL.
     */
    url?: string;
}

/**
 * A value that is produced by and may be retrieved from an invocation image.
 */
export interface Output {
    /**
     * The actions that produce this output.
     */
    applyTo?: string[];
    /**
     * The name of a definition containing the schema for the output.
     */
    definition: string;
    /**
     * A human-readable description of the output.
     */
    description?: string;
    /**
     * The path in the invocation image where the output will be produced.
     */
    path: string;
}

/**
 * A parameter that can be given a value when executing the invocation image.
 */
export interface Parameter {
    /**
     * The actions that consume this parameter.
     */
    applyTo?: string[];
    /**
     * The name of a definition containing the schema for the parameter.
     * This may be used for validating parameter values before executing the
     * invocation image.
     */
    definition: string;
    /**
     * A human-readable description of the parameter.
     */
    description?: string;
    /**
     * Specifies where the parameter value will be surfaced in the invocation image.
     */
    destination: ParameterDestination;
    /**
     * Whether the parameter must be supplied in the actions that consume it.
     */
    required?: boolean;
}

/**
 * Specifies where a parameter value will be surfaced in the invocation image.
 */
export interface ParameterDestination {
    /**
     * The environment variable through which to surface the parameter value in the running invocation image.
     */
    env?: string;
    /**
     * The file path at which to mount the parameter value in the running invocation image.
     */
    path?: string;
}
