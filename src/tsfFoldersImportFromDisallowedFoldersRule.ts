import * as Lint from "tslint";
import * as ts from "typescript";

export class Rule extends Lint.Rules.AbstractRule {
    // include the rule ID, to make it easier to disable
    static FAILURE_STRING: string = "do not import from invalid folder like 'DISALLOWED_TEXT' (tsf-folders-import-from-disallowed-folders)";

    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const walker = new ImportsWalker(sourceFile, this.getOptions());
        this.applyWithWalker(walker);

        return walker.getFailures();
    }
}

class ImportsWalker extends Lint.RuleWalker {
    visitImportDeclaration(node: ts.ImportDeclaration) {
        this.validate(node, node.moduleSpecifier.getText());
    }

    visitImportEqualsDeclaration(node: ts.ImportEqualsDeclaration) {
        this.validate(node, node.moduleReference.getText());

        super.visitImportEqualsDeclaration(node);
    }

    private validate(node: ts.Node, text: string) {
        const options = this.getOptions();
        if (options.length !== 1) {
            throw new Error("tslint rule is misconfigured (tsf-folders-import-from-disallowed-folders)");
        }

        const disallowedTexts: string[] = this.getOptions()[0].disallowed;

        for (const disallowed of disallowedTexts) {
            if (text.indexOf(disallowed) >= 0) {
                this.addFailureAtNode(node, Rule.FAILURE_STRING.replace("DISALLOWED_TEXT", disallowed));

                // one error per line is enough!
                return;
            }
        }
    }
}
