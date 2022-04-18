import { Location } from "vscode-languageserver";
import { notEmpty } from "../../utils";

export interface BasicNode {
    readonly type: NodeType
    readonly location: Location
    getChildren(): BasicNode[]
}

export class FileNode implements BasicNode {
    readonly type = NodeType.File;
    constructor(
        readonly location: Location,
        readonly lines: LineNode[]
    ) {}
    public getChildren(): BasicNode[] {
        return this.lines;
    }
}

export class LineNode implements BasicNode {
    readonly type = NodeType.Line;
    constructor(
        readonly location: Location,
        readonly label: LabelNode | null,
        readonly command: AllComandNode | null
    ) {}
    public getChildren(): BasicNode[] {
        return [this.label, this.command].filter(notEmpty);
    }
}

export type AllComandNode = CommandNode | IfDirectiveNode | RepeatDirectiveNode | MacroDirectiveNode;

export class LabelNode implements BasicNode {
    readonly type = NodeType.Label;
    constructor(
        readonly location: Location,
        readonly name: IdentifierNode
    ) {}
    public getChildren(): BasicNode[] {
        return [this.name];
    }
}

export class IdentifierNode implements BasicNode {
    readonly type = NodeType.Identifier;
    constructor(
        readonly location: Location,
        readonly name: string
    ) {}
    public getChildren(): BasicNode[] {
        return [];
    }
}

export class IfDirectiveNode implements BasicNode {
    readonly type = NodeType.IfDirective;
    constructor(
        readonly location: Location,
        readonly ifType: IfDirectiveType,
        readonly condition: ExpressionNode,
        readonly thenBody: LineNode[],
        readonly elseBody: LineNode[]
    ) {}
    public getChildren(): BasicNode[] {
        const result: BasicNode[] = [this.condition];
        result.push(...this.thenBody);
        result.push(...this.elseBody);
        return result;
    }
}

export class RepeatDirectiveNode implements BasicNode {
    readonly type = NodeType.RepeatDirective;
    constructor(
        readonly location: Location,
        readonly expression: ExpressionNode,
        readonly body: LineNode[]
    ) {}
    public getChildren(): BasicNode[] {
        const result: BasicNode[] = [this.expression];
        result.push(...this.body);
        return result;
    }
}

export class MacroDirectiveNode implements BasicNode {
    readonly type = NodeType.MacroDirective;
    constructor(
        readonly location: Location,
        readonly name: IdentifierNode,
        readonly body: LineNode[]
    ) {}
    public getChildren(): BasicNode[] {
        const result: BasicNode[] = [this.name];
        result.push(...this.body);
        return result;
    }
}

export class CommandNode implements BasicNode {
    readonly type = NodeType.Command;
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
    readonly type = NodeType.StringLiteral;
    constructor(
        readonly location: Location,
        readonly text: string
    ) {}
    public getChildren(): BasicNode[] {
        return [];
    }
}

export class ArgumentNode implements BasicNode {
    readonly type = NodeType.Argument;
    constructor(
        readonly location: Location,
        readonly addressMode: AddressMode,
        readonly value: ExpressionNode
    ) {}
    public getChildren(): BasicNode[] {
        return [this.value];
    }
}

export class NumberNode implements BasicNode {
    readonly type = NodeType.Number;
    constructor(
        readonly location: Location,
        readonly value: number
    ) {}
    public getChildren(): BasicNode[] {
        return [];
    }
}

export type ExpressionNode = UnaryOperatorNode | BinaryOperatorNode | BracketsNode |
    StringLiteralNode | IdentifierNode | NumberNode;

export class UnaryOperatorNode implements BasicNode {
    readonly type = NodeType.UnaryOperator;
    constructor(
        readonly location: Location,
        readonly operatorType: UnaryOperatorType,
        readonly operand: ExpressionNode
    ) {}
    public getChildren(): BasicNode[] {
        return [this.operand];
    }
}

export class BinaryOperatorNode implements BasicNode {
    readonly type = NodeType.BinaryOperator;
    constructor(
        readonly location: Location,
        readonly operatorType: BinaryOperatorType,
        readonly left: ExpressionNode,
        readonly right: ExpressionNode
    ) {}
    public getChildren(): BasicNode[] {
        return [this.left, this.right];
    }
}

export class BracketsNode implements BasicNode {
    readonly type = NodeType.Brackets;
    constructor(
        readonly location: Location,
        readonly value: ExpressionNode
    ) {}
    public getChildren(): BasicNode[] {
        return [this.value];
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
    UnaryOperator = 'UnaryOperator',
    BinaryOperator = 'BinaryOperator',
    Brackets = 'Brackets',
    IfDirective = 'IfDirective',
    RepeatDirective = 'RepeatDirective',
    MacroDirective = 'MacroDirective'
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

export enum UnaryOperatorType {
    OneComplement = 'OneComplement',
    Negation = 'Negation',
    Not = 'Not',
    TakeLSB = 'TakeLSB',
    TakeMSB = 'TakeMSB'
}

export enum BinaryOperatorType {
    Multiplication = 'Multiplication',
    Division = 'Division',
    Modulus = 'Modulus',
    Addition = 'Addition',
    Subtraction = 'Subtraction',
    ArithmeticShiftRight = 'ArithmeticShiftRight',
    ArithmeticShiftLeft = 'ArithmeticShiftLeft',
    GreatherThan = 'GreatherThan',
    GreatherThanOrEqual = 'GreatherThanOrEqual',
    LessThan = 'LessThan',
    LessThanOrEqual = 'LessThanOrEqual',
    Equal = 'Equal',
    NotEqual = 'NotEqual',
    ArithmeticAnd = 'ArithmeticAnd',
    ArithmeticExclusiveOr = 'ArithmeticExclusiveOr',
    ArithmeticOr = 'ArithmeticOr',
    LogicalAnd = 'LogicalAnd',
    LogicalOr = 'LogicalOr',
    InlineIf = 'InlineIf'
}

export enum IfDirectiveType {
    If = 'If',
    IfConst = 'IfConst',
    IfNConst = 'IfNConst'
}
