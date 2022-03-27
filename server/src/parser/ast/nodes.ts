import { Location } from "vscode-languageserver";

interface BasicNode {
    readonly type: NodeType
    readonly location: Location
}

export class FileNode implements BasicNode {
    readonly type: NodeType = NodeType.File;
    constructor(
        readonly location: Location,
        readonly lines: LineNode[]
    ) {}
}

export class LineNode implements BasicNode {
    readonly type: NodeType = NodeType.Line;
    constructor(
        readonly location: Location,
        readonly label: LabelNode | null,
        readonly command: CommandNode | null
    ) {}
}

export class LabelNode implements BasicNode {
    readonly type: NodeType = NodeType.Label;
    constructor(
        readonly location: Location,
        readonly name: StringLiteralNode,
        readonly isLocal: boolean
    ) {}
}

export class CommandNode implements BasicNode {
    readonly type: NodeType = NodeType.Command;
    constructor(
        readonly location: Location,
        readonly name: StringLiteralNode,
        readonly args: ArgumentNode[]
    ) {}
}

export class StringLiteralNode implements BasicNode {
    readonly type: NodeType = NodeType.StringLiteral;
    constructor(
        readonly location: Location,
        readonly text: string
    ) {}
}

export class ArgumentNode implements BasicNode {
    readonly type: NodeType = NodeType.Argument;
    constructor(
        readonly location: Location,
        readonly addressMode: AddressMode,
        readonly value: StringLiteralNode | NumberNode 
    ) {}
}

export class NumberNode implements BasicNode {
    readonly type: NodeType = NodeType.Number;
    constructor(
        readonly location: Location,
        readonly value: number
    ) {}
}

export enum NodeType {
    Label = 'Label',
    Command = 'Command',
    CommandName = 'CommandName',
    Arguments = 'Arguments',
    Argument = 'Argument',
    Literal = 'Literal',
    Comment = 'Comment',
    Number = 'Number',
    File = 'File',
    Line = "Line",
    StringLiteral = 'StringLiteral',
    Immediate = 'Immediate',
    IndirectX = 'IndirectX',
    IndirectY = 'IndirectY',
    Indirect = 'Indirect',
    AddressX = 'AddressX',
    AddressY = 'AddressY',
}

export enum AddressMode {
    None = 'None',
    Immediate = 'Immediate',
    AddressX = 'AddressX',
    AddressY = 'AddressY',
    IndirectX = 'IndirectX',
    IndirectY = 'IndirectY',
    Indirect = 'Indirect',
}
