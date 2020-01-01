import * as Lint from "tslint";
import * as ts from "typescript";

import { ConfigFactory } from "./config/ConfigFactory";
import { TestBreakpointRuleConfig } from "./model/TestBreakpointRuleConfig";
import { RuleId } from "./RuleId";
import { GeneralRuleUtils } from "./utils/GeneralRuleUtils";

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const config = ConfigFactory.createForTestBreakpointRule(this.getOptions());

        if (!GeneralRuleUtils.isFileInPaths(sourceFile.fileName, config.includePaths)) {
            return [];
        }

        return this.applyWithFunction<TestBreakpointRuleConfig>(sourceFile, walk, config);
    }
}

const walk = (ctx: Lint.WalkContext<TestBreakpointRuleConfig>) => {
    return ts.forEachChild(ctx.sourceFile, checkNode);

    function checkNode(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            visitCallExpression(node as ts.CallExpression, ctx);
        }

        return ts.forEachChild(node, checkNode);
    }
};

function visitCallExpression(
    node: ts.CallExpression,
    ctx: Lint.WalkContext<TestBreakpointRuleConfig>
) {
    const text = node.getText();

    if (ctx.options.debugTokens.some(token => text.startsWith(token))) {
        ctx.addFailureAtNode(
            node.getFirstToken() || node,
            GeneralRuleUtils.buildFailureString(
                "do not hard code breakpoints in the test",
                RuleId.TsfFoldersTestWithBreakpoint
            )
        );
    }
}
