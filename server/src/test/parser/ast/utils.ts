import assert = require("assert");
import { NodeType, IfDirectiveType, AddressMode, UnaryOperatorType, BinaryOperatorType } from "../../../parser/ast/nodes";
import { parseText } from "../../../parser/ast/utils";
import { filterByMask } from "./objectCopy";

export function checkAST(text: string, ...lines: TestLineNode[]) {
    const actualResult = parseText('', text);
    assert.ok(actualResult.errors.length == 0, "Unexpected errors");
    const ast = actualResult.ast;
    const expectedAst: TestFileNode = {
        type: NodeType.File,
        lines: lines
    };
    assert.deepStrictEqual(filterByMask(ast, expectedAst), expectedAst);
}

export type TestFileNode = {
    type: NodeType.File,
    lines: TestLineNode[]
}

export type TestLineNode = {
    type: NodeType.Line,
    label: TestLabelNode | null,
    command: TestCommandNode | TestIfDirecitveNode | TestRepeatDirecitveNode | TestMacroDirectiveNode | null
}

export type TestLabelNode = {
    type: NodeType.Label,
    name: TestIdentifierNode | TestDynamicLabel,
}

export type TestIfDirecitveNode = {
    type: NodeType.IfDirective,
    ifType: IfDirectiveType,
    condition: TestExpressionNode,
    thenBody: TestLineNode[],
    elseBody: TestLineNode[]
}

export type TestRepeatDirecitveNode = {
    type: NodeType.RepeatDirective,
    expression: TestExpressionNode,
    body: TestLineNode[]
}

export type TestMacroDirectiveNode = {
    type: NodeType.MacroDirective,
    name: TestIdentifierNode,
    body: string
}

export type TestCommandNode = {
    type: NodeType.Command,
    name: TestIdentifierNode,
    args: TestArgumentNode[]
}

export type TestStringLiteralNode = {
    type: NodeType.StringLiteral,
    text: string
}

export type TestArgumentNode = {
    type: NodeType.Argument,
    addressMode: AddressMode,
    value: TestExpressionNode
}

export type TestExpressionNode = TestStringLiteralNode | TestIdentifierNode | TestNumberNode |
    TestUnaryOperatorNode | TestBinaryOperatorNode | TestBracketsNode | TestCharLiteralNode |
    TestDynamicLabel;

export type TestUnaryOperatorNode = {
    type: NodeType.UnaryOperator,
    operatorType: UnaryOperatorType,
    operand: TestExpressionNode
}

export type TestBinaryOperatorNode = {
    type: NodeType.BinaryOperator,
    operatorType: BinaryOperatorType,
    left: TestExpressionNode,
    right: TestExpressionNode
}

export type TestBracketsNode = {
    type: NodeType.Brackets,
    value: TestExpressionNode
}

export type TestNumberNode = {
    type: NodeType.Number,
    value: number
}

export type TestIdentifierNode = {
    type: NodeType.Identifier,
    name: string
}

export type TestCharLiteralNode = {
    type: NodeType.CharLiteral,
    value: string
}

export type TestDynamicLabel = {
    type: NodeType.DynamicLabel,
    identifiers: TestIdentifierNode[]
}
