import { IToken } from "chevrotain";
import { Location } from "vscode-languageserver";
import * as cst from "../cst/cstTypes";
import * as ast from "./nodes";
import { createRange, RangeSource } from "./utils";

export class Visitor {
    constructor(
        readonly uri: string
    ) {}

    public constructAst(text: cst.TextCstNode): ast.FileNode {
        return new ast.FileNode(
            this.createLocation(text), 
            (text.children.line||[])
                .filter(it => it.location?.startColumn)
                .map(it => this.convertLine(it))
        );
    }

    private convertLine(lineNode: cst.LineCstNode): ast.LineNode {
        return new ast.LineNode(
            this.createLocation(lineNode), 
            this.convertLabel(lineNode.children.label), 
            this.convertCommand(lineNode.children.identifier, lineNode.children.argument)
        );
    }

    private convertLabel(label?: cst.LabelCstNode[]): ast.LabelNode | null {
        if (!label) return null;
        return new ast.LabelNode(
            this.createLocation(label[0]),
            this.convertIdentifier(label[0].children.identifier[0])
        );
    }

    private convertCommand(commandName?: IToken[], argument?: cst.ArgumentCstNode[]): ast.CommandNode | null {
        if (!commandName) return null;
        let commandEnd: RangeSource = commandName[0];
        if (argument) commandEnd = argument[argument.length-1];
        return new ast.CommandNode(
            this.createLocation(commandName[0], commandEnd),
            this.convertIdentifier(commandName[0]),
            (argument || []).map(it => this.convertArgument(it))
        );
    }

    private convertArgument(argumentNode: cst.ArgumentCstNode): ast.ArgumentNode {
        const children = argumentNode.children;
        if (children.immediateArgument) return this.convertImmediateArgument(children.immediateArgument[0]);
        if (children.indirectArgument) return this.convertIndirectArgument(children.indirectArgument[0]);
        return this.convertAddressXYArgument(children.addressXYArgument![0]);
    }

    private convertImmediateArgument(argument: cst.ImmediateArgumentCstNode): ast.ArgumentNode {
        return new ast.ArgumentNode(
            this.createLocation(argument),
            ast.AddressMode.Immediate,
            this.convertExpression(argument.children.expression[0])
        );
    }

    private convertIndirectArgument(argument: cst.IndirectArgumentCstNode): ast.ArgumentNode {
        return new ast.ArgumentNode(
            this.createLocation(argument),
            getIndirectAddressMode(argument.children),
            this.convertExpression(argument.children.expression[0])
        );
    }

    private convertAddressXYArgument(argument: cst.AddressXYArgumentCstNode): ast.ArgumentNode {
        return new ast.ArgumentNode(
            this.createLocation(argument),
            getAdressXYMode(argument.children),
            this.convertExpression(argument.children.expression[0])
        );
    }

    private convertExpression(expression: cst.ExpressionCstNode): ast.ExpressionNode {
        const unaryExpressions = expression.children.unaryExpression.map(it => this.convertUnaryExpression(it));
        if (!expression.children.binarySign) return unaryExpressions[0];
        const binaryOperators = expression.children.binarySign.map(getBinaryOperatorType);
        let leftExpression = unaryExpressions.shift()!;
        while (unaryExpressions.length > 0) {
            const right = unaryExpressions.shift()!;
            const operator = binaryOperators.shift()!;
            leftExpression = new ast.BinaryOperatorNode(
                this.createLocation(leftExpression, right),
                operator,
                leftExpression,
                right
            );
        }
        return leftExpression;
    }

    private convertUnaryExpression(expression: cst.UnaryExpressionCstNode): ast.ExpressionNode {
        const childern = expression.children;
        if (childern.identifier) return this.convertIdentifier(childern.identifier[0]);
        if (childern.number) return this.convertNumber(childern.number[0]);
        if (childern.roundBrackets) return this.convertBrackets(childern.roundBrackets[0]);
        if (childern.squareBrackets) return this.convertBrackets(childern.squareBrackets[0]);
        if (childern.stringLiteral) return this.convertStringLiteral(childern.stringLiteral[0]);
        return this.convertUnaryOperator(childern.unaryOperator![0]);
    }

    private convertUnaryOperator(operator: cst.UnaryOperatorCstNode): ast.UnaryOperatorNode {
        return new ast.UnaryOperatorNode(
            this.createLocation(operator),
            getUnaryOperatorType(operator),
            this.convertUnaryOperatorValue(operator.children.unaryOperatorValue[0])
        );
    }

    private convertUnaryOperatorValue(value: cst.UnaryOperatorValueCstNode): ast.ExpressionNode {
        const childern = value.children;
        if (childern.identifier) return this.convertIdentifier(childern.identifier[0]);
        if (childern.number) return this.convertNumber(childern.number[0]);
        if (childern.roundBrackets) return this.convertBrackets(childern.roundBrackets[0]);
        if (childern.squareBrackets) return this.convertBrackets(childern.squareBrackets[0]);
        return this.convertStringLiteral(childern.stringLiteral![0]);
    }

    private convertBrackets(brackets: cst.RoundBracketsCstNode | cst.SquareBracketsCstNode): ast.BracketsNode {
        return new ast.BracketsNode(
            this.createLocation(brackets),
            this.convertExpression(brackets.children.expression[0])
        );
    }

    private convertStringLiteral(literal: IToken): ast.StringLiteralNode {
        return new ast.StringLiteralNode(
            this.createLocation(literal),
            literal.image.substring(1, literal.image.length - 1)
        );
    }

    private convertNumber(numberNode: cst.NumberCstNode): ast.NumberNode {
        const children = numberNode.children;
        let value = 0;
        if (children.binaryNumber)
            value = parseInt(children.binaryNumber[0].image.substring(1), 2);
        if (children.octalNumber)
            value = parseInt(children.octalNumber[0].image, 8);
        if (children.decimalNumber)
            value = parseInt(children.decimalNumber[0].image, 10);
        if (children.hexadecimalNumber)
            value = parseInt(children.hexadecimalNumber[0].image.substring(1), 16);
        return new ast.NumberNode(
            this.createLocation(numberNode),
            value
        );
    }

    private convertIdentifier(identifierToken: IToken): ast.IdentifierNode {
        return new ast.IdentifierNode(
            this.createLocation(identifierToken),
            identifierToken.image
        );
    }

    private createLocation(start: RangeSource, end?: RangeSource): Location {
        return Location.create(this.uri, createRange(start, end));
    }
}

function getIndirectAddressMode(node: cst.IndirectArgumentCstChildren): ast.AddressMode {
    if (node.indirectXEnding) return ast.AddressMode.IndirectX;
    if (node.indirectYEnding) return ast.AddressMode.IndirectY;
    return ast.AddressMode.Indirect;
}

function getAdressXYMode(node: cst.AddressXYArgumentCstChildren): ast.AddressMode {
    if (node.addressXEnding) return ast.AddressMode.AddressX;
    if (node.addressYEnding) return ast.AddressMode.AddressY;
    return ast.AddressMode.None;
}

function getBinaryOperatorType(node: cst.BinarySignCstNode): ast.BinaryOperatorType {
    const childern = node.children;
    if (childern.multiplicationSign) return ast.BinaryOperatorType.Multiplication;
    if (childern.divisionSign) return ast.BinaryOperatorType.Division;
    if (childern.percentSign) return ast.BinaryOperatorType.Modulus;
    if (childern.additionSign) return ast.BinaryOperatorType.Addition;
    if (childern.minusSign) return ast.BinaryOperatorType.Subtraction;
    if (childern.shiftRightSign) return ast.BinaryOperatorType.ArithmeticShiftRight;
    if (childern.shiftLeftSign) return ast.BinaryOperatorType.ArithmeticShiftLeft;
    if (childern.greatherSign) return ast.BinaryOperatorType.GreatherThan;
    if (childern.greatherOrEqualSign) return ast.BinaryOperatorType.GreatherThanOrEqual;
    if (childern.lessSign) return ast.BinaryOperatorType.LessThan;
    if (childern.lessOrEqualSign) return ast.BinaryOperatorType.LessThanOrEqual;
    if (childern.equalSigh) return ast.BinaryOperatorType.Equal;
    if (childern.notEqualSign) return ast.BinaryOperatorType.NotEqual;
    if (childern.arithmeticAndSign) return ast.BinaryOperatorType.ArithmeticAnd;
    if (childern.xorSign) return ast.BinaryOperatorType.ArithmeticExclusiveOr;
    if (childern.arithmeticOrSign) return ast.BinaryOperatorType.ArithmeticOr;
    if (childern.logicalAndSign) return ast.BinaryOperatorType.LogicalAnd;
    if (childern.logicalOrSign) return ast.BinaryOperatorType.LogicalOr;
    return ast.BinaryOperatorType.InlineIf;
}

function getUnaryOperatorType(node: cst.UnaryOperatorCstNode): ast.UnaryOperatorType {
    const childern = node.children;
    if (childern.tilde) return ast.UnaryOperatorType.OneComplement;
    if (childern.minusSign) return ast.UnaryOperatorType.Negation;
    if (childern.exclamationMark) return ast.UnaryOperatorType.Not;
    if (childern.lessSign) return ast.UnaryOperatorType.TakeLSB;
    return ast.UnaryOperatorType.TakeMSB;
}
