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
  comment?: IToken[];
};

export interface LabelCstNode extends CstNode {
  name: "label";
  children: LabelCstChildren;
}

export type LabelCstChildren = {
  labelName: LabelNameCstNode[];
  colon?: IToken[];
};

export interface ArgumentCstNode extends CstNode {
  name: "argument";
  children: ArgumentCstChildren;
}

export type ArgumentCstChildren = {
  immediateArgument?: ImmediateArgumentCstNode[];
  addressXArgument?: AddressXArgumentCstNode[];
  addressYArgument?: AddressYArgumentCstNode[];
  indirectArgument?: IndirectArgumentCstNode[];
  indirectXArgument?: IndirectXArgumentCstNode[];
  indirectYArgument?: IndirectYArgumentCstNode[];
  simpleArgument?: SimpleArgumentCstNode[];
};

export interface ImmediateArgumentCstNode extends CstNode {
  name: "immediateArgument";
  children: ImmediateArgumentCstChildren;
}

export type ImmediateArgumentCstChildren = {
  sharp: IToken[];
  simpleArgument: SimpleArgumentCstNode[];
};

export interface AddressXArgumentCstNode extends CstNode {
  name: "addressXArgument";
  children: AddressXArgumentCstChildren;
}

export type AddressXArgumentCstChildren = {
  simpleArgument: SimpleArgumentCstNode[];
  addressXEnding: IToken[];
};

export interface AddressYArgumentCstNode extends CstNode {
  name: "addressYArgument";
  children: AddressYArgumentCstChildren;
}

export type AddressYArgumentCstChildren = {
  simpleArgument: SimpleArgumentCstNode[];
  addressYEnding: IToken[];
};

export interface IndirectXArgumentCstNode extends CstNode {
  name: "indirectXArgument";
  children: IndirectXArgumentCstChildren;
}

export type IndirectXArgumentCstChildren = {
  openParenthesis: IToken[];
  simpleArgument: SimpleArgumentCstNode[];
  indirectXEnding: IToken[];
};

export interface IndirectYArgumentCstNode extends CstNode {
  name: "indirectYArgument";
  children: IndirectYArgumentCstChildren;
}

export type IndirectYArgumentCstChildren = {
  openParenthesis: IToken[];
  simpleArgument: SimpleArgumentCstNode[];
  indirectYEnding: IToken[];
};

export interface IndirectArgumentCstNode extends CstNode {
  name: "indirectArgument";
  children: IndirectArgumentCstChildren;
}

export type IndirectArgumentCstChildren = {
  openParenthesis: IToken[];
  simpleArgument: SimpleArgumentCstNode[];
  closeParenthesis: IToken[];
};

export interface SimpleArgumentCstNode extends CstNode {
  name: "simpleArgument";
  children: SimpleArgumentCstChildren;
}

export type SimpleArgumentCstChildren = {
  stringLiteral?: IToken[];
  number?: NumberCstNode[];
  labelName?: LabelNameCstNode[];
};

export interface LabelNameCstNode extends CstNode {
  name: "labelName";
  children: LabelNameCstChildren;
}

export type LabelNameCstChildren = {
  localLabel?: IToken[];
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
  addressXArgument(children: AddressXArgumentCstChildren, param?: IN): OUT;
  addressYArgument(children: AddressYArgumentCstChildren, param?: IN): OUT;
  indirectXArgument(children: IndirectXArgumentCstChildren, param?: IN): OUT;
  indirectYArgument(children: IndirectYArgumentCstChildren, param?: IN): OUT;
  indirectArgument(children: IndirectArgumentCstChildren, param?: IN): OUT;
  simpleArgument(children: SimpleArgumentCstChildren, param?: IN): OUT;
  labelName(children: LabelNameCstChildren, param?: IN): OUT;
  number(children: NumberCstChildren, param?: IN): OUT;
}
