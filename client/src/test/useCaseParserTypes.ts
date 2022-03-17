import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface TextCstNode extends CstNode {
  name: "text";
  children: TextCstChildren;
}

export type TextCstChildren = {
  textLine: TextLineCstNode[];
  lineSeparator?: IToken[];
};

export interface TextLineCstNode extends CstNode {
  name: "textLine";
  children: TextLineCstChildren;
}

export type TextLineCstChildren = {
  textWithTag?: TextWithTagCstNode[];
};

export interface TextWithTagCstNode extends CstNode {
  name: "textWithTag";
  children: TextWithTagCstChildren;
}

export type TextWithTagCstChildren = {
  other: IToken[];
  tag?: TagCstNode[];
};

export interface TagCstNode extends CstNode {
  name: "tag";
  children: TagCstChildren;
}

export type TagCstChildren = {
  openBrace: IToken[];
  textLine?: TextLineCstNode[];
  pipe: IToken[];
  word: IToken[];
  comma?: IToken[];
  closeBrace: IToken[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  text(children: TextCstChildren, param?: IN): OUT;
  textLine(children: TextLineCstChildren, param?: IN): OUT;
  textWithTag(children: TextWithTagCstChildren, param?: IN): OUT;
  tag(children: TagCstChildren, param?: IN): OUT;
}
