import {
    DisabledTestRuleConfig, getDefaultDisabledTestRuleConfig
} from "../model/DisabledTestRuleConfig";
import { FilenamesRuleConfig } from "../model/FilenamesRuleConfig";
import { ImportsBetweenPackagesRuleConfig } from "../model/ImportsBetweenPackagesRuleConfig";
import {
    getDefaultBreakpointRuleConfig, TestBreakpointRuleConfig
} from "../model/TestBreakpointRuleConfig";
import { RuleId } from "../RuleId";

export namespace ConfigFactory {
    export function createForBetweenPackages(options: any): ImportsBetweenPackagesRuleConfig {
        const config = create<ImportsBetweenPackagesRuleConfig>(
            options,
            RuleId.TsfFoldersImportsBetweenPackages
        );

        // TODO xxx validate a bit (at least importPath should be set, allowedToImport should refer to recognised importPath)

        return config;
    }

    export function createForFilenames(options: any): FilenamesRuleConfig {
        const config = createFromArguments<FilenamesRuleConfig>(
            options,
            RuleId.TsfFoldersFileNames
        );

        config.casings = (config as any)["file-name-casing"];

        validate(config, "casings", RuleId.TsfFoldersFileNames);
        validate(config, "ignorePaths", RuleId.TsfFoldersFileNames);

        return config;
    }

    export function createForDisabledTestRule(options: any): DisabledTestRuleConfig {
        // older config had just 'true':
        if (options.ruleArguments.length === 0) {
            return getDefaultDisabledTestRuleConfig();
        }

        const config = createFromArguments<DisabledTestRuleConfig>(
            options,
            RuleId.TsfFoldersDisabledTest
        );

        validate(config, "ban", RuleId.TsfFoldersDisabledTest);
        validate(config, "includePaths", RuleId.TsfFoldersDisabledTest);

        return config;
    }

    export function createForTestBreakpointRule(options: any): TestBreakpointRuleConfig {
        // older config had just 'true':
        if (options.ruleArguments.length === 0) {
            return getDefaultBreakpointRuleConfig();
        }

        const config = createFromArguments<TestBreakpointRuleConfig>(
            options,
            RuleId.TsfFoldersTestWithBreakpoint
        );

        validate(config, "debugTokens", RuleId.TsfFoldersTestWithBreakpoint);
        validate(config, "includePaths", RuleId.TsfFoldersTestWithBreakpoint);

        return config;
    }

    function validate(config: any, prop: string, ruleId: string) {
        if (config[prop] === undefined) {
            throw new Error(`invalid config for rule ${ruleId} - ${prop} is missing`);
        }
    }

    function create<T>(options: any, ruleId: string): T {
        if (options.length !== 1) {
            throw new Error(
                `tslint rule is misconfigured (${ruleId}) - options length is ${options.length}`
            );
        }

        const config: T = options[0].config;
        return config;
    }

    function createFromArguments<T>(options: any, ruleId: string): T {
        const args = options.ruleArguments;

        if (args.length !== 1) {
            throw new Error(
                `tslint rule is misconfigured (${ruleId}) - options.ruleArguments length is ${
                    args.length
                }`
            );
        }

        const config: T = args[0];

        return config;
    }
}
