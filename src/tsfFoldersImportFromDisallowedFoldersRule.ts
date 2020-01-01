import * as Lint from "tslint";
import * as ts from "typescript";

import { RuleId } from "./RuleId";

type DisallowedFolderOption = {
    disallowed: string[];
};

export class Rule extends Lint.Rules.AbstractRule {
    // include the rule ID, to make it easier to disable
    static FAILURE_STRING: string = `do not import from invalid folder like 'DISALLOWED_TEXT' (${RuleId.TsfFoldersImportFromDisallowedFolders})`;

    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction<DisallowedFolderOption>(
            sourceFile,
            walk,
            this.getDisallowedFolders()
        );
    }

    private getDisallowedFolders(): DisallowedFolderOption {
        const options = this.getOptions().ruleArguments as DisallowedFolderOption[];

        if (options.length !== 1) {
            throw new Error(
                `tslint rule is misconfigured (${RuleId.TsfFoldersImportFromDisallowedFolders})`
            );
        }

        return options[0];
    }
}

const walk = (ctx: Lint.WalkContext<DisallowedFolderOption>) => {
    return ts.forEachChild(ctx.sourceFile, checkNode);

    function checkNode(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            visitImportDeclaration(node as ts.ImportDeclaration, ctx);
        } else if (node.kind === ts.SyntaxKind.ImportEqualsDeclaration) {
            visitImportEqualsDeclaration(node as ts.ImportEqualsDeclaration, ctx);
        }

        return ts.forEachChild(node, checkNode);
    }
};

function visitImportDeclaration(
    node: ts.ImportDeclaration,
    ctx: Lint.WalkContext<DisallowedFolderOption>
) {
    validate(node, node.moduleSpecifier.getText(), ctx);
}

function visitImportEqualsDeclaration(
    node: ts.ImportEqualsDeclaration,
    ctx: Lint.WalkContext<DisallowedFolderOption>
) {
    validate(node, node.moduleReference.getText(), ctx);
}

function validate(node: ts.Node, text: string, ctx: Lint.WalkContext<DisallowedFolderOption>) {
    const disallowedTexts = ctx.options.disallowed;

    for (const disallowed of disallowedTexts) {
        if (text.indexOf(disallowed) >= 0) {
            ctx.addFailureAtNode(node, Rule.FAILURE_STRING.replace("DISALLOWED_TEXT", disallowed));

            // one error per line is enough!
            return;
        }
    }
}
