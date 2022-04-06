import { CstParser } from "chevrotain";
import { TextCstNode } from "./cstTypes";
import * as lexer from "./lexer";

class DasmParser extends CstParser {
    constructor() {
        super(lexer.ALL_TOKENS, {
            nodeLocationTracking: "full"
        });
        this.performSelfAnalysis();
    }

    public text = this.RULE('text', () => {
        this.MANY_SEP({
            SEP: lexer.NewLineSeparator,
            DEF: () => {
                this.SUBRULE(this.line);
            }
        });
    }) as () => TextCstNode;

    private line = this.RULE('line', () => {
        this.OPTION1(() => {this.SUBRULE(this.label);});
        this.OPTION2(() => {
            this.CONSUME1(lexer.Space);
            this.CONSUME(lexer.Identifier);
            this.MANY({
                DEF: () => {
                    this.CONSUME2(lexer.Space);
                    this.SUBRULE(this.argument);
                }
            });
        });
        this.OPTION3(() => {this.CONSUME(lexer.Space);});
        this.OPTION4(() => {this.CONSUME(lexer.Comment);});
    })

    private label = this.RULE('label', () => {
        this.SUBRULE(this.lablelName);
        this.OPTION(() => {this.CONSUME(lexer.Colon);});
    })

    private argument = this.RULE('argument', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.immediateArgument)},
            {ALT: () => this.SUBRULE(this.addressXArgument)},
            {ALT: () => this.SUBRULE(this.addressYArgument)},
            {ALT: () => this.SUBRULE(this.indirectArgument)},
            {ALT: () => this.SUBRULE(this.indirectXArgument)},
            {ALT: () => this.SUBRULE(this.indirectYArgument)},
            {ALT: () => this.SUBRULE(this.simpleArgument)}
        ]);
    })

    private immediateArgument = this.RULE('immediateArgument', () => {
        this.CONSUME(lexer.Sharp);
        this.SUBRULE(this.simpleArgument);
    })

    private addressXArgument = this.RULE('addressXArgument', () => {
        this.SUBRULE(this.simpleArgument);
        this.CONSUME(lexer.AddressXEnding);
    })

    private addressYArgument = this.RULE('addressYArgument', () => {
        this.SUBRULE(this.simpleArgument);
        this.CONSUME(lexer.AddressYEnding);
    })

    private indirectXArgument = this.RULE('indirectXArgument', () => {
        this.CONSUME(lexer.OpenParenthesis);
        this.SUBRULE(this.simpleArgument);
        this.CONSUME(lexer.IndirectXEnding);
    })

    private indirectYArgument = this.RULE('indirectYArgument', () => {
        this.CONSUME(lexer.OpenParenthesis);
        this.SUBRULE(this.simpleArgument);
        this.CONSUME(lexer.IndirectYEnding);
    })

    private indirectArgument = this.RULE('indirectArgument', () => {
        this.CONSUME(lexer.OpenParenthesis);
        this.SUBRULE(this.simpleArgument);
        this.CONSUME(lexer.CloseParenthesis);
    })

    private simpleArgument = this.RULE('simpleArgument', () => {
        this.OR([
            {ALT: () => this.CONSUME(lexer.StringLiteral)},
            {ALT: () => this.SUBRULE(this.number)},
            {ALT: () => this.SUBRULE(this.lablelName)}
        ]);
    })

    private lablelName = this.RULE('labelName', () => {
        this.OR([
            {ALT: () => this.CONSUME(lexer.LocalLabel)},
            {ALT: () => this.CONSUME(lexer.Identifier)}
        ]);
    })

    private number = this.RULE('number', () => {
        this.OR([
            {ALT: () => this.CONSUME(lexer.BinaryNumber)},
            {ALT: () => this.CONSUME(lexer.OctalNumber)},
            {ALT: () => this.CONSUME(lexer.DecimalNumber)},
            {ALT: () => this.CONSUME(lexer.HexadecimalNumber)}
        ]);
    })
}

export const DASM_PARSER = new DasmParser();
