import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import { consoleTestResultHandler, runTest } from "tslint/lib/test";
import * as parse from "tslint/lib/verify/parse";

import { RuleId } from "../src/RuleId";
import { RuleFactory } from "./rules/RuleFactory";
import { getSourceFileFromPath } from "./rules/testUtils/tslint-palantir/utils";

class ConsoleLogger {
    log(m: any) {
        console.log(m);
    }

    error(m: any) {
        console.error(m);
    }
}

const MARKUP_FILE_EXTENSION = ".lint";

describe("tslint-ban-snippets tests", () => {
    it("works if true is truthy", () => {
        expect(true).toBeTruthy();
    });

    const testDirectories = glob.sync("test/rules/**/tslint.json").map(path.dirname);

    describe("standard tslint test runner (NO code coverage!)", () => {
        for (const testDirectory of testDirectories) {
            it(`should run tests at ${testDirectory}`, () => {
                const result = runTest(testDirectory);

                const isOk = consoleTestResultHandler(result, new ConsoleLogger());

                expect(isOk).toBeTruthy();
            });
        }
    });

    describe("custom tslint test runner (WITH code coverage, but cruder assertions)", () => {
        for (const testDirectory of testDirectories) {
            describe(`tests at ${testDirectory}`, () => {
                const filesToLint = glob.sync(
                    path.join(testDirectory, `**/*${MARKUP_FILE_EXTENSION}`)
                );

                for (const fileToLint of filesToLint) {
                    it(`should run custom rule code on file ${fileToLint}`, () => {
                        const tsLintConfig = readTslintConfigFromDirectory(testDirectory);

                        const rule = RuleFactory.createRuleForTestDirectoryPath(
                            testDirectory,
                            tsLintConfig
                        );
                        expect(rule).toBeTruthy();

                        const sourceFile = getSourceFileFromPath(fileToLint);

                        const ruleFailures = rule.apply(sourceFile);

                        // perform a crude check - the tslint test runner already performs detailed checks
                        const errorsFromMarkup = parse.parseErrorsFromMarkup(sourceFile.text);

                        // "debug statement" and "call expression" can double up:
                        expect(ruleFailures.length).toBeGreaterThanOrEqual(errorsFromMarkup.length);
                    });
                }
            });
        }
    });
});

function readTslintConfigFromDirectory(testDirectory: string): any {
    const pathToOptions = path.join(testDirectory, "tslint.json");

    const text = fs.readFileSync(pathToOptions, "utf8");

    return JSON.parse(text);
}
