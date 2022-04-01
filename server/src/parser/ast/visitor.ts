import { CstNode, IToken } from "chevrotain";
import { Location, Range } from "vscode-languageserver";
import { AddressXArgumentCstNode, AddressYArgumentCstNode, ArgumentCstNode, ImmediateArgumentCstNode, IndirectArgumentCstNode, IndirectXArgumentCstNode, IndirectYArgumentCstNode, LabelCstNode, LabelNameCstNode, LineCstNode, NumberCstNode, SimpleArgumentCstNode, TextCstNode } from "../cst/cstTypes";
import { AddressMode, ArgumentNode, CommandNode, FileNode, IdentifierNode, LabelNode, LineNode, NumberNode, StringLiteralNode } from "./nodes";

export class Visitor {
    constructor(
        readonly uri: string
    ) {}

    public constructAst(text: TextCstNode): FileNode {
        return new FileNode(
            this.createLocation(text), 
            (text.children.line||[]).map(it => this.convertLine(it))
        );
    }

    private convertLine(lineNode: LineCstNode): LineNode {
        return new LineNode(
            this.createLocation(lineNode), 
            this.convertLabel(lineNode.children.label), 
            this.convertCommand(lineNode.children.identifier, lineNode.children.argument)
        );
    }

    private convertLabel(label?: LabelCstNode[]): LabelNode | null {
        if (!label) return null;
        const labelName = label[0].children.labelName[0];
        const labelLocation = this.createLocation(label[0]);
        if (labelName.children.localLabel)
            return new LabelNode(
                labelLocation, 
                this.convertIdentifier(labelName.children.localLabel[0]), 
                true
            );
        else
            return new LabelNode(
                labelLocation, 
                this.convertIdentifier(labelName.children.identifier![0]), 
                false
            );
    }

    private convertCommand(commandName?: IToken[], argument?: ArgumentCstNode[]): CommandNode | null {
        if (!commandName) return null;
        let commandEndLine = commandName[0].endLine!;
        let commandEndColumn = commandName[0].endColumn!;
        if (argument) {
            const lastArgumentLocation = argument[argument.length-1].location!;
            commandEndLine = lastArgumentLocation.endLine!;
            commandEndColumn = lastArgumentLocation.endColumn!;
        }
        return new CommandNode(
            Location.create(this.uri, Range.create(
                commandName[0].startLine!,
                commandName[0].startColumn!,
                commandEndLine,
                commandEndColumn
            )),
            this.convertIdentifier(commandName[0]),
            (argument || []).map(it => this.convertArgument(it))
        );
    }

    private convertArgument(argumentNode: ArgumentCstNode): ArgumentNode {
        const children = argumentNode.children;
        if (children.immediateArgument) return this.convertImmediateArgument(children.immediateArgument[0]);
        if (children.addressXArgument) return this.convertAddressXArgument(children.addressXArgument[0]);
        if (children.addressYArgument) return this.convertAddressYArgument(children.addressYArgument[0]);
        if (children.indirectArgument) return this.convertIndirectArgument(children.indirectArgument[0]);
        if (children.indirectXArgument) return this.convertIndirectXArgument(children.indirectXArgument[0]);
        if (children.indirectYArgument) return this.convertIndirectYArgument(children.indirectYArgument[0]);
        return new ArgumentNode(
            this.createLocation(argumentNode),
            AddressMode.None,
            this.convertSimpleArgument(children.simpleArgument![0])
        );
    }

    private convertImmediateArgument(argument: ImmediateArgumentCstNode): ArgumentNode {
        return new ArgumentNode(
            this.createLocation(argument),
            AddressMode.Immediate,
            this.convertSimpleArgument(argument.children.simpleArgument[0])
        );
    }

    private convertAddressXArgument(argument: AddressXArgumentCstNode): ArgumentNode {
        return new ArgumentNode(
            this.createLocation(argument),
            AddressMode.AddressX,
            this.convertSimpleArgument(argument.children.simpleArgument[0])
        );
    }

    private convertAddressYArgument(argument: AddressYArgumentCstNode): ArgumentNode {
        return new ArgumentNode(
            this.createLocation(argument),
            AddressMode.AddressY,
            this.convertSimpleArgument(argument.children.simpleArgument[0])
        );
    }

    private convertIndirectArgument(argument: IndirectArgumentCstNode): ArgumentNode {
        return new ArgumentNode(
            this.createLocation(argument),
            AddressMode.Indirect,
            this.convertSimpleArgument(argument.children.simpleArgument[0])
        );
    }

    private convertIndirectXArgument(argument: IndirectXArgumentCstNode): ArgumentNode {
        return new ArgumentNode(
            this.createLocation(argument),
            AddressMode.IndirectX,
            this.convertSimpleArgument(argument.children.simpleArgument[0])
        );
    }

    private convertIndirectYArgument(argument: IndirectYArgumentCstNode): ArgumentNode {
        return new ArgumentNode(
            this.createLocation(argument),
            AddressMode.IndirectY,
            this.convertSimpleArgument(argument.children.simpleArgument[0])
        );
    }

    private convertSimpleArgument(simpleArgument: SimpleArgumentCstNode): StringLiteralNode | IdentifierNode | NumberNode {
        const children = simpleArgument.children;
        if (children.labelName) return this.convertLabelUsage(children.labelName[0]);
        if (children.number) return this.convertNumber(children.number[0]);
        return this.convertStringLiteral(children.stringLiteral![0]);
    }

    private convertStringLiteral(literal: IToken): StringLiteralNode {
        return new StringLiteralNode(
            this.createLocationFromToken(literal),
            literal.image.substring(1, literal.image.length - 1)
        );
    }

    private convertNumber(numberNode: NumberCstNode): NumberNode {
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
        return new NumberNode(
            this.createLocation(numberNode),
            value
        );
    }

    private convertLabelUsage(labelNode: LabelNameCstNode): IdentifierNode {
        const childern = labelNode.children;
        if (childern.localLabel) return this.convertIdentifier(childern.localLabel[0]);
        return this.convertIdentifier(childern.identifier![0]);
    }

    private convertIdentifier(identifierToken: IToken): IdentifierNode {
        return new IdentifierNode(
            this.createLocationFromToken(identifierToken),
            identifierToken.image
        );
    }

    private createLocation(node: CstNode): Location {
        const nodeLocation = node.location!;
        return Location.create(this.uri, Range.create(
            nodeLocation.startLine!,
            nodeLocation.startColumn!,
            nodeLocation.endLine!,
            nodeLocation.endColumn!
        ));
    }

    private createLocationFromToken(token: IToken): Location {
        return Location.create(this.uri, Range.create(
            token.startLine!,
            token.startColumn!,
            token.endLine!,
            token.endColumn!
        ));
    }
}
