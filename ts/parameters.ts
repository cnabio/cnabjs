import { Bundle, Parameter } from "./bundle-manifest";

export namespace Parameters {

    /**
     * Gets the parameters applicable to a specific action, such as 'install'.
     * @param bundle The bundle from which to get parameters.
     * @param actionName The action whose parameters you are requesting.
     * @returns The names of the parameters which apply the specified action.
     */
    export function forAction(bundle: Bundle, actionName: string): ReadonlyArray<string> {
        if (!bundle.parameters) {
            return [];
        }

        const allParameters = Object.entries(bundle.parameters);
        return allParameters.filter(([_, parameter]) => appliesTo(actionName, parameter))
                            .map(([name, _]) => name);
    }

    function appliesTo(actionName: string, parameter: Parameter): boolean {
        if (!parameter.applyTo || parameter.applyTo.length === 0) {
            return true;
        }
        return parameter.applyTo.includes(actionName);
    }

}
