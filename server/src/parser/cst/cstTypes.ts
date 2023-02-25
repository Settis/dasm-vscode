import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface TextCstNode extends CstNode {
  name: "text";
  children: TextCstChildren;
}

export type TextCstChildren = {
  line?: LineCstNode[];
  newLineSeprarator?: IToken[];
};

export interface LineCstNode extends CstNode {
  name: "line";
  children: LineCstChildren;
}

export type LineCstChildren = {
  label?: LabelCstNode[];
  space?: (IToken)[];
  command?: CommandCstNode[];
};

export interface LabelCstNode extends CstNode {
  name: "label";
  children: LabelCstChildren;
}

export type LabelCstChildren = {
  dynamicLabelDefinition: DynamicLabelDefinitionCstNode[];
  colon?: IToken[];
};

export interface DynamicLabelDefinitionCstNode extends CstNode {
  name: "dynamicLabelDefinition";
  children: DynamicLabelDefinitionCstChildren;
}

export type DynamicLabelDefinitionCstChildren = {
  identifier: IToken[];
  comma?: IToken[];
};

export interface CommandCstNode extends CstNode {
  name: "command";
  children: CommandCstChildren;
}

export type CommandCstChildren = {
  ifCommand?: IfCommandCstNode[];
  repeatCommand?: RepeatCommandCstNode[];
  macroCommand?: MacroCommandCstNode[];
  generalCommand?: GeneralCommandCstNode[];
};

export interface IfCommandCstNode extends CstNode {
  name: "ifCommand";
  children: IfCommandCstChildren;
}

export type IfCommandCstChildren = {
  ifConstKeyword?: IToken[];
  ifNConstKeyword?: IToken[];
  ifKeyword?: IToken[];
  space: IToken[];
  expression: ExpressionCstNode[];
  text: (TextCstNode)[];
  elseKeyword?: IToken[];
  endIfKeyword: IToken[];
};

export interface RepeatCommandCstNode extends CstNode {
  name: "repeatCommand";
  children: RepeatCommandCstChildren;
}

export type RepeatCommandCstChildren = {
  repeatKeyword: IToken[];
  space: IToken[];
  expression: ExpressionCstNode[];
  text: TextCstNode[];
  rependKeyword: IToken[];
};

export interface MacroCommandCstNode extends CstNode {
  name: "macroCommand";
  children: MacroCommandCstChildren;
}

export type MacroCommandCstChildren = {
  macroKeyword: IToken[];
  space: IToken[];
  nonSpace: IToken[];
  macroText: MacroTextCstNode[];
  endMacroKeyword: IToken[];
};

export interface MacroTextCstNode extends CstNode {
  name: "macroText";
  children: MacroTextCstChildren;
}

export type MacroTextCstChildren = {
  macroTextPart?: MacroTextPartCstNode[];
};

export interface MacroTextPartCstNode extends CstNode {
  name: "macroTextPart";
  children: MacroTextPartCstChildren;
}

export type MacroTextPartCstChildren = {
  newLineSeprarator?: IToken[];
  space?: IToken[];
  nonSpace?: IToken[];
};

export interface GeneralCommandCstNode extends CstNode {
  name: "generalCommand";
  children: GeneralCommandCstChildren;
}

export type GeneralCommandCstChildren = {
  commandName: CommandNameCstNode[];
  space?: (IToken)[];
  argument?: ArgumentCstNode[];
  comma?: IToken[];
};

export interface CommandNameCstNode extends CstNode {
  name: "commandName";
  children: CommandNameCstChildren;
}

export type CommandNameCstChildren = {
  assignSign?: IToken[];
  identifier?: IToken[];
};

export interface ArgumentCstNode extends CstNode {
  name: "argument";
  children: ArgumentCstChildren;
}

export type ArgumentCstChildren = {
  immediateArgument?: ImmediateArgumentCstNode[];
  addressXYArgument?: AddressXYArgumentCstNode[];
  indirectArgument?: IndirectArgumentCstNode[];
};

export interface ImmediateArgumentCstNode extends CstNode {
  name: "immediateArgument";
  children: ImmediateArgumentCstChildren;
}

export type ImmediateArgumentCstChildren = {
  sharp: IToken[];
  expression: ExpressionCstNode[];
};

export interface AddressXYArgumentCstNode extends CstNode {
  name: "addressXYArgument";
  children: AddressXYArgumentCstChildren;
}

export type AddressXYArgumentCstChildren = {
  expression: ExpressionCstNode[];
  addressXEnding?: IToken[];
  addressYEnding?: IToken[];
};

export interface IndirectArgumentCstNode extends CstNode {
  name: "indirectArgument";
  children: IndirectArgumentCstChildren;
}

export type IndirectArgumentCstChildren = {
  openParenthesis: IToken[];
  expression: ExpressionCstNode[];
  closeParenthesis?: IToken[];
  indirectXEnding?: IToken[];
  indirectYEnding?: IToken[];
};

export interface ExpressionCstNode extends CstNode {
  name: "expression";
  children: ExpressionCstChildren;
}

export type ExpressionCstChildren = {
  unaryExpression: (UnaryExpressionCstNode)[];
  space?: (IToken)[];
  binarySign?: BinarySignCstNode[];
};

export interface BinarySignCstNode extends CstNode {
  name: "binarySign";
  children: BinarySignCstChildren;
}

export type BinarySignCstChildren = {
  multiplicationSign?: IToken[];
  divisionSign?: IToken[];
  percentSign?: IToken[];
  additionSign?: IToken[];
  minusSign?: IToken[];
  shiftRightSign?: IToken[];
  shiftLeftSign?: IToken[];
  greatherSign?: IToken[];
  greatherOrEqualSign?: IToken[];
  lessSign?: IToken[];
  lessOrEqualSign?: IToken[];
  equalSigh?: IToken[];
  notEqualSign?: IToken[];
  arithmeticAndSign?: IToken[];
  xorSign?: IToken[];
  arithmeticOrSign?: IToken[];
  logicalAndSign?: IToken[];
  logicalOrSign?: IToken[];
  questionMark?: IToken[];
};

export interface UnaryExpressionCstNode extends CstNode {
  name: "unaryExpression";
  children: UnaryExpressionCstChildren;
}

export type UnaryExpressionCstChildren = {
  roundBrackets?: RoundBracketsCstNode[];
  squareBrackets?: SquareBracketsCstNode[];
  unaryOperator?: UnaryOperatorCstNode[];
  stringLiteral?: IToken[];
  number?: NumberCstNode[];
  dynamicLabel?: DynamicLabelCstNode[];
  multiplicationSign?: IToken[];
  macroArgument?: MacroArgumentCstNode[];
  charLiteral?: IToken[];
};

export interface DynamicLabelCstNode extends CstNode {
  name: "dynamicLabel";
  children: DynamicLabelCstChildren;
}

export type DynamicLabelCstChildren = {
  identifier: IToken[];
  dynamicLabelSeparator?: IToken[];
};

export interface RoundBracketsCstNode extends CstNode {
  name: "roundBrackets";
  children: RoundBracketsCstChildren;
}

export type RoundBracketsCstChildren = {
  openParenthesis: IToken[];
  space?: (IToken)[];
  expression: ExpressionCstNode[];
  closeParenthesis: IToken[];
};

export interface SquareBracketsCstNode extends CstNode {
  name: "squareBrackets";
  children: SquareBracketsCstChildren;
}

export type SquareBracketsCstChildren = {
  openSquareBracket: IToken[];
  space?: (IToken)[];
  expression: ExpressionCstNode[];
  closeSquareBracket: IToken[];
  decimalFormatFlag?: IToken[];
};

export interface UnaryOperatorCstNode extends CstNode {
  name: "unaryOperator";
  children: UnaryOperatorCstChildren;
}

export type UnaryOperatorCstChildren = {
  tilde?: IToken[];
  minusSign?: IToken[];
  exclamationMark?: IToken[];
  lessSign?: IToken[];
  greatherSign?: IToken[];
  space?: IToken[];
  unaryOperatorValue: UnaryOperatorValueCstNode[];
};

export interface UnaryOperatorValueCstNode extends CstNode {
  name: "unaryOperatorValue";
  children: UnaryOperatorValueCstChildren;
}

export type UnaryOperatorValueCstChildren = {
  roundBrackets?: RoundBracketsCstNode[];
  squareBrackets?: SquareBracketsCstNode[];
  stringLiteral?: IToken[];
  number?: NumberCstNode[];
  identifier?: IToken[];
};

export interface NumberCstNode extends CstNode {
  name: "number";
  children: NumberCstChildren;
}

export type NumberCstChildren = {
  binaryNumber?: IToken[];
  octalNumber?: IToken[];
  decimalNumber?: IToken[];
  hexadecimalNumber?: IToken[];
};

export interface MacroArgumentCstNode extends CstNode {
  name: "macroArgument";
  children: MacroArgumentCstChildren;
}

export type MacroArgumentCstChildren = {
  openCurlyBracket: IToken[];
  decimalNumber: IToken[];
  closeCurlyBracket: IToken[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  text(children: TextCstChildren, param?: IN): OUT;
  line(children: LineCstChildren, param?: IN): OUT;
  label(children: LabelCstChildren, param?: IN): OUT;
  dynamicLabelDefinition(children: DynamicLabelDefinitionCstChildren, param?: IN): OUT;
  command(children: CommandCstChildren, param?: IN): OUT;
  ifCommand(children: IfCommandCstChildren, param?: IN): OUT;
  repeatCommand(children: RepeatCommandCstChildren, param?: IN): OUT;
  macroCommand(children: MacroCommandCstChildren, param?: IN): OUT;
  macroText(children: MacroTextCstChildren, param?: IN): OUT;
  macroTextPart(children: MacroTextPartCstChildren, param?: IN): OUT;
  generalCommand(children: GeneralCommandCstChildren, param?: IN): OUT;
  commandName(children: CommandNameCstChildren, param?: IN): OUT;
  argument(children: ArgumentCstChildren, param?: IN): OUT;
  immediateArgument(children: ImmediateArgumentCstChildren, param?: IN): OUT;
  addressXYArgument(children: AddressXYArgumentCstChildren, param?: IN): OUT;
  indirectArgument(children: IndirectArgumentCstChildren, param?: IN): OUT;
  expression(children: ExpressionCstChildren, param?: IN): OUT;
  binarySign(children: BinarySignCstChildren, param?: IN): OUT;
  unaryExpression(children: UnaryExpressionCstChildren, param?: IN): OUT;
  dynamicLabel(children: DynamicLabelCstChildren, param?: IN): OUT;
  roundBrackets(children: RoundBracketsCstChildren, param?: IN): OUT;
  squareBrackets(children: SquareBracketsCstChildren, param?: IN): OUT;
  unaryOperator(children: UnaryOperatorCstChildren, param?: IN): OUT;
  unaryOperatorValue(children: UnaryOperatorValueCstChildren, param?: IN): OUT;
  number(children: NumberCstChildren, param?: IN): OUT;
  macroArgument(children: MacroArgumentCstChildren, param?: IN): OUT;
}
