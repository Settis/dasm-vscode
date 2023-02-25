import { IToken } from "chevrotain";
import { Location } from "vscode-languageserver";
import { EQU } from "../../dasm/directives";
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
                .filter(it => !(it.label === null && it.command === null))
        );
    }

    private convertLine(lineNode: cst.LineCstNode): ast.LineNode {
        return new ast.LineNode(
            this.createLocation(lineNode), 
            this.convertLabel(lineNode.children.label), 
            this.convertCommand(lineNode.children.command)
        );
    }

    private convertLabel(label?: cst.LabelCstNode[]): ast.LabelNode | null {
        if (!label) return null;
        const childern = label[0].children;
        const labelNameNode = this.convertDynamicLabel(childern.dynamicLabelDefinition[0]);
        return new ast.LabelNode(
            this.createLocation(label[0]),
            labelNameNode
        );
    }

    private convertDynamicLabel(dynamicLabel: cst.DynamicLabelCstNode | cst.DynamicLabelDefinitionCstNode): ast.IdentifierNode | ast.DynamicLabelNode {
        const childern = dynamicLabel.children;
        const identifiers = childern.identifier.map(it => this.convertIdentifier(it));
        if (identifiers.length == 1)
            return identifiers[0];
        return new ast.DynamicLabelNode(
            this.createLocation(dynamicLabel),
            identifiers
        );
    }

    private convertCommand(commandNodes?: cst.CommandCstNode[]): ast.AllComandNode | null {
        if (!commandNodes) return null;
        const commandChildren = commandNodes[0].children;
        if (commandChildren.ifCommand) return this.convertIfCommand(commandChildren.ifCommand[0]);
        if (commandChildren.repeatCommand) return this.convertRepeatCommand(commandChildren.repeatCommand[0]);
        if (commandChildren.macroCommand) return this.convertMacroCommand(commandChildren.macroCommand[0]);
        return this.convertGeneralCommand(commandChildren.generalCommand![0]);
    }

    private convertIfCommand(command: cst.IfCommandCstNode): ast.IfDirectiveNode {
        const thenTextLines = this.constructAst(command.children.text[0]).lines;
        let elseTextLines: ast.LineNode[] = [];
        if (command.children.text[1]) elseTextLines = this.constructAst(command.children.text[1]).lines;
        return new ast.IfDirectiveNode(
            this.createLocation(command),
            getIfDirectiveType(command),
            this.convertExpression(command.children.expression[0]),
            thenTextLines,
            elseTextLines
        );
    }

    private convertRepeatCommand(command: cst.RepeatCommandCstNode): ast.RepeatDirectiveNode {
        return new ast.RepeatDirectiveNode(
            this.createLocation(command),
            this.convertExpression(command.children.expression[0]),
            this.constructAst(command.children.text[0]).lines
        );
    }

    private convertMacroCommand(command: cst.MacroCommandCstNode): ast.MacroDirectiveNode {
        return new ast.MacroDirectiveNode(
            this.createLocation(command),
            this.convertIdentifier(command.children.nonSpace[0]),
            this.convertMacroText(command.children.macroText[0])
        );
    }

    private convertMacroText(macroText: cst.MacroTextCstNode): string {
        return (macroText.children.macroTextPart || []).map(this.convertMacroTextPart).join('');
    }

    private convertMacroTextPart(macroTestPart: cst.MacroTextPartCstNode): string {
        const childern = macroTestPart.children;
        if (childern.newLineSeprarator)
            return childern.newLineSeprarator[0].image;
        if (childern.nonSpace)
            return childern.nonSpace[0].image;
        if (childern.space)
            return childern.space[0].image;
        return "";
    }

    private convertGeneralCommand(command: cst.GeneralCommandCstNode): ast.CommandNode | null {
        const commandName = command.children.commandName; 
        const argument = command.children.argument;
        if (!commandName) return null;
        let commandEnd: RangeSource = commandName[0];
        if (argument) commandEnd = argument[argument.length-1];
        return new ast.CommandNode(
            this.createLocation(commandName[0], commandEnd),
            this.convertCommandName(commandName[0]),
            (argument || []).map(it => this.convertArgument(it))
        );
    }

    private convertCommandName(commandName: cst.CommandNameCstNode): ast.IdentifierNode {
        const childern = commandName.children;
        if (childern.assignSign)
            return new ast.IdentifierNode(
                this.createLocation(childern.assignSign[0]),
                EQU
            );
        const identifierToken = childern.identifier![0];
        // Command name can contain extension like: ds.w
        const splitedName = identifierToken.image.split('.');
        // Command also can start with leading dot, like: .WORD
        const commandNameWithoutExtension = splitedName[0] ? splitedName[0] : splitedName[1];
        return new ast.IdentifierNode(
            this.createLocation(identifierToken),
            commandNameWithoutExtension
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
        if (childern.dynamicLabel) return this.convertDynamicLabel(childern.dynamicLabel[0]);
        if (childern.multiplicationSign) return this.convertIdentifier(childern.multiplicationSign[0]);
        if (childern.number) return this.convertNumber(childern.number[0]);
        if (childern.roundBrackets) return this.convertBrackets(childern.roundBrackets[0]);
        if (childern.squareBrackets) return this.convertBrackets(childern.squareBrackets[0]);
        if (childern.stringLiteral) return this.convertStringLiteral(childern.stringLiteral[0]);
        if (childern.charLiteral) return this.convertCharLiteral(childern.charLiteral[0]);
        if (childern.macroArgument) return this.convertMacroArgument(childern.macroArgument[0]);
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

    private convertCharLiteral(literal: IToken): ast.CharLiteralNode {
        return new ast.CharLiteralNode(
            this.createLocation(literal),
            literal.image.substring(1)
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

    private convertMacroArgument(argument: cst.MacroArgumentCstNode): ast.MacroArgumentNode {
        return new ast.MacroArgumentNode(
            this.createLocation(argument),
            parseInt(argument.children.decimalNumber[0].image)
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
    switch (Object.keys(node.children)[0]) {
        case 'multiplicationSign': return ast.BinaryOperatorType.Multiplication;
        case 'divisionSign': return ast.BinaryOperatorType.Division;
        case 'percentSign': return ast.BinaryOperatorType.Modulus;
        case 'additionSign': return ast.BinaryOperatorType.Addition;
        case 'minusSign': return ast.BinaryOperatorType.Subtraction;
        case 'shiftRightSign': return ast.BinaryOperatorType.ArithmeticShiftRight;
        case 'shiftLeftSign': return ast.BinaryOperatorType.ArithmeticShiftLeft;
        case 'greatherSign': return ast.BinaryOperatorType.GreatherThan;
        case 'greatherOrEqualSign': return ast.BinaryOperatorType.GreatherThanOrEqual;
        case 'lessSign': return ast.BinaryOperatorType.LessThan;
        case 'lessOrEqualSign': return ast.BinaryOperatorType.LessThanOrEqual;
        case 'equalSigh': return ast.BinaryOperatorType.Equal;
        case 'notEqualSign': return ast.BinaryOperatorType.NotEqual;
        case 'arithmeticAndSign': return ast.BinaryOperatorType.ArithmeticAnd;
        case 'xorSign': return ast.BinaryOperatorType.ArithmeticExclusiveOr;
        case 'arithmeticOrSign': return ast.BinaryOperatorType.ArithmeticOr;
        case 'logicalAndSign': return ast.BinaryOperatorType.LogicalAnd;
        case 'logicalOrSign': return ast.BinaryOperatorType.LogicalOr;
        default: return ast.BinaryOperatorType.InlineIf;
    }
}

function getUnaryOperatorType(node: cst.UnaryOperatorCstNode): ast.UnaryOperatorType {
    const childern = node.children;
    if (childern.tilde) return ast.UnaryOperatorType.OneComplement;
    if (childern.minusSign) return ast.UnaryOperatorType.Negation;
    if (childern.exclamationMark) return ast.UnaryOperatorType.Not;
    if (childern.lessSign) return ast.UnaryOperatorType.TakeLSB;
    return ast.UnaryOperatorType.TakeMSB;
}

function getIfDirectiveType(node: cst.IfCommandCstNode): ast.IfDirectiveType {
    const childern = node.children;
    if (childern.ifConstKeyword) return ast.IfDirectiveType.IfConst;
    if (childern.ifNConstKeyword) return ast.IfDirectiveType.IfNConst;
    return ast.IfDirectiveType.If;
}
