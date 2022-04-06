import { Location } from "vscode-languageserver";
import { notEmpty } from "../../utils";

export interface BasicNode {
    readonly type: NodeType
    readonly location: Location
    getChildren(): BasicNode[]
}

export class FileNode implements BasicNode {
    readonly type: NodeType = NodeType.File;
    constructor(
        readonly location: Location,
        readonly lines: LineNode[]
    ) {}
    public getChildren(): BasicNode[] {
        return this.lines;
    }
}

export class LineNode implements BasicNode {
    readonly type: NodeType = NodeType.Line;
    constructor(
        readonly location: Location,
        readonly label: LabelNode | null,
        readonly command: CommandNode | null
    ) {}
    public getChildren(): BasicNode[] {
        return [this.label, this.command].filter(notEmpty);
    }
}

export class LabelNode implements BasicNode {
    readonly type: NodeType = NodeType.Label;
    constructor(
        readonly location: Location,
        readonly name: IdentifierNode,
        readonly isLocal: boolean
    ) {}
    public getChildren(): BasicNode[] {
        return [this.name];
    }
}

export class IdentifierNode implements BasicNode {
    readonly type: NodeType = NodeType.Identifier;
    constructor(
        readonly location: Location,
        readonly name: string
    ) {}
    public getChildren(): BasicNode[] {
        return [];
    }
}

export class CommandNode implements BasicNode {
    readonly type: NodeType = NodeType.Command;
    constructor(
        readonly location: Location,
        readonly name: IdentifierNode,
        readonly args: ArgumentNode[]
    ) {}
    public getChildren(): BasicNode[] {
        const result: BasicNode[] = [this.name];
        result.push(...this.args);
        return result;
    }
}

export class StringLiteralNode implements BasicNode {
    readonly type: NodeType = NodeType.StringLiteral;
    constructor(
        readonly location: Location,
        readonly text: string
    ) {}
    public getChildren(): BasicNode[] {
        return [];
    }
}

export class ArgumentNode implements BasicNode {
    readonly type: NodeType = NodeType.Argument;
    constructor(
        readonly location: Location,
        readonly addressMode: AddressMode,
        readonly value: StringLiteralNode | IdentifierNode | NumberNode 
    ) {}
    public getChildren(): BasicNode[] {
        return [this.value];
    }
}

export class NumberNode implements BasicNode {
    readonly type: NodeType = NodeType.Number;
    constructor(
        readonly location: Location,
        readonly value: number
    ) {}
    public getChildren(): BasicNode[] {
        return [];
    }
}

export enum NodeType {
    Label = 'Label',
    Command = 'Command',
    Identifier = 'Identifier',
    Argument = 'Argument',
    Number = 'Number',
    File = 'File',
    Line = "Line",
    StringLiteral = 'StringLiteral',
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
