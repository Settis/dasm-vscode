import { DocumentUri, Location } from "vscode-languageserver";
import { AsmLine } from "../dasm/asmLine";

export type Node = LabelNode | CommandNode | CommandNameNode | CommentNode | ArgumentsNode | LiteralNode | NumberNode | FileNode | 
    StringLiteralNode | ImmediateNode | IndirectXNode | IndirectYNode | IndirectNode | AddressXNode | AddressYNode ;

interface BasicNode {
    type: NodeType
    parent?: Node
    location: Location
    children: Node[]
}

export interface LabelNode extends BasicNode {
    type: NodeType.Label
    name: string
    relatedObject?: RelatedObject
}

export interface CommandNode extends BasicNode {
    type: NodeType.Command
}

export interface CommandNameNode extends BasicNode {
    type: NodeType.CommandName
    name: string
}

export interface CommentNode extends BasicNode {
    type: NodeType.Comment
    comment: string
}

export type RelatedContext = { [key: string]: RelatedObject }

export type RelatedObject = {
    definitions: LabelNode[],
    usages: LiteralNode[]
}

export interface ArgumentsNode extends BasicNode {
    type: NodeType.Arguments
}

export interface LiteralNode extends BasicNode {
    type: NodeType.Literal
    text: string
    relatedObject?: RelatedObject
}

export interface NumberNode extends BasicNode {
    type: NodeType.Number
    text: string
    value: number
}

export interface FileNode extends BasicNode {
    type: NodeType.File
}

export interface StringLiteralNode extends BasicNode {
    type: NodeType.StringLiteral
    text: string
}

export interface ImmediateNode extends BasicNode {
    type: NodeType.Immediate
}

export interface IndirectXNode extends BasicNode {
    type: NodeType.IndirectX
}

export interface IndirectYNode extends BasicNode {
    type: NodeType.IndirectY
}

export interface IndirectNode extends BasicNode {
    type: NodeType.Indirect
}

export interface AddressXNode extends BasicNode {
    type: NodeType.AddressX
}

export interface AddressYNode extends BasicNode {
    type: NodeType.AddressY
}

export enum NodeType {
    Label = 'Label',
    Command = 'Command',
    CommandName = 'CommandName',
    Arguments = 'Arguments',
    Literal = 'Literal',
    Comment = 'Comment',
    Number = 'Number',
    File = 'File',
    StringLiteral = 'StringLiteral',
    Immediate = 'Immediate',
    IndirectX = 'IndirectX',
    IndirectY = 'IndirectY',
    Indirect = 'Indirect',
    AddressX = 'AddressX',
    AddressY = 'AddressY',
}

export type DocumentLine = {
    uri: DocumentUri,
    lineNumber: number,
    asmLine: AsmLine
}
