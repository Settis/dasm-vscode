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
  identifier?: IToken[];
  argument?: ArgumentCstNode[];
};

export interface LabelCstNode extends CstNode {
  name: "label";
  children: LabelCstChildren;
}

export type LabelCstChildren = {
  identifier: IToken[];
  colon?: IToken[];
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
  squareBrackets?: SquareBracketsCstNode[];
  unaryOperator?: UnaryOperatorCstNode[];
  stringLiteral?: IToken[];
  number?: NumberCstNode[];
  identifier?: IToken[];
};

export interface RoundBracketsCstNode extends CstNode {
  name: "roundBrackets";
  children: RoundBracketsCstChildren;
}

export type RoundBracketsCstChildren = {
  openParenthesis: IToken[];
  expression: ExpressionCstNode[];
  closeParenthesis: IToken[];
};

export interface SquareBracketsCstNode extends CstNode {
  name: "squareBrackets";
  children: SquareBracketsCstChildren;
}

export type SquareBracketsCstChildren = {
  openSquareBracket: IToken[];
  expression: ExpressionCstNode[];
  closeSquareBracket: IToken[];
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

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  text(children: TextCstChildren, param?: IN): OUT;
  line(children: LineCstChildren, param?: IN): OUT;
  label(children: LabelCstChildren, param?: IN): OUT;
  argument(children: ArgumentCstChildren, param?: IN): OUT;
  immediateArgument(children: ImmediateArgumentCstChildren, param?: IN): OUT;
  addressXYArgument(children: AddressXYArgumentCstChildren, param?: IN): OUT;
  indirectArgument(children: IndirectArgumentCstChildren, param?: IN): OUT;
  expression(children: ExpressionCstChildren, param?: IN): OUT;
  unaryExpression(children: UnaryExpressionCstChildren, param?: IN): OUT;
  roundBrackets(children: RoundBracketsCstChildren, param?: IN): OUT;
  squareBrackets(children: SquareBracketsCstChildren, param?: IN): OUT;
  unaryOperator(children: UnaryOperatorCstChildren, param?: IN): OUT;
  number(children: NumberCstChildren, param?: IN): OUT;
}
