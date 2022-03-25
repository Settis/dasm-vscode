import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface TextCstNode extends CstNode {
  name: "text";
  children: TextCstChildren;
}

export type TextCstChildren = {
  statement: StatementCstNode[];
};

export interface StatementCstNode extends CstNode {
  name: "statement";
  children: StatementCstChildren;
}

export type StatementCstChildren = {
  identifier: IToken[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  text(children: TextCstChildren, param?: IN): OUT;
  statement(children: StatementCstChildren, param?: IN): OUT;
}
