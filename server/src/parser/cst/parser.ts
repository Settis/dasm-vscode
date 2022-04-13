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
    })

    private label = this.RULE('label', () => {
        this.CONSUME(lexer.Identifier);
        this.OPTION(() => {this.CONSUME(lexer.Colon);});
    })

    private argument = this.RULE('argument', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.immediateArgument)},
            {ALT: () => this.SUBRULE(this.addressXYArgument)},
            {
                GATE: () => this.LA(1).tokenType == lexer.OpenParenthesis,
                ALT: () => this.SUBRULE(this.indirectArgument)
            },
        ]);
    })

    private immediateArgument = this.RULE('immediateArgument', () => {
        this.CONSUME(lexer.Sharp);
        this.SUBRULE(this.expression);
    })

    private addressXYArgument = this.RULE('addressXYArgument', () => {
        this.SUBRULE(this.expression);
        this.OPTION(() => this.OR([
                {ALT: () => this.CONSUME(lexer.AddressXEnding)},
                {ALT: () => this.CONSUME(lexer.AddressYEnding)}
            ])
        );
    })

    private indirectArgument = this.RULE('indirectArgument', () => {
        this.CONSUME(lexer.OpenParenthesis);
        this.SUBRULE(this.expression);
        this.OR([
            {ALT: () => this.CONSUME(lexer.CloseParenthesis)},
            {ALT: () => this.CONSUME(lexer.IndirectXEnding)},
            {ALT: () => this.CONSUME(lexer.IndirectYEnding)}
        ]);
    })

    private expression = this.RULE('expression', () => {
        this.SUBRULE1(this.unaryExpression);
        this.MANY(() => {
            this.SUBRULE(this.binarySign);
            this.SUBRULE2(this.unaryExpression);
        });
    })

    private binarySign = this.RULE('binarySign', () => {
        this.OR([
            {ALT: () => this.CONSUME(lexer.MultiplicationSign)},
            {ALT: () => this.CONSUME(lexer.DivisionSign)},
            {ALT: () => this.CONSUME(lexer.PercentSign)},
            {ALT: () => this.CONSUME(lexer.AdditionSign)},
            {ALT: () => this.CONSUME(lexer.MinusSign)},
            {ALT: () => this.CONSUME(lexer.ShiftRightSign)},
            {ALT: () => this.CONSUME(lexer.ShiftLeftSign)},
            {ALT: () => this.CONSUME(lexer.GreatherSign)},
            {ALT: () => this.CONSUME(lexer.GreatherOrEqualSign)},
            {ALT: () => this.CONSUME(lexer.LessSigh)},
            {ALT: () => this.CONSUME(lexer.LessOrEqualSign)},
            {ALT: () => this.CONSUME(lexer.EqualSign)},
            {ALT: () => this.CONSUME(lexer.NotEqualSign)},
            {ALT: () => this.CONSUME(lexer.ArithmeticAndSign)},
            {ALT: () => this.CONSUME(lexer.XorSign)},
            {ALT: () => this.CONSUME(lexer.ArithmeticOrSign)},
            {ALT: () => this.CONSUME(lexer.LogicalAndSign)},
            {ALT: () => this.CONSUME(lexer.LogicalOrSign)},
            {ALT: () => this.CONSUME(lexer.QuestionMark)}
        ]);
    })

    private unaryExpression = this.RULE('unaryExpression', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.roundBrackets)},
            {ALT: () => this.SUBRULE(this.squareBrackets)},
            {ALT: () => this.SUBRULE(this.unaryOperator)},
            {ALT: () => this.CONSUME(lexer.StringLiteral)},
            {ALT: () => this.SUBRULE(this.number)},
            {ALT: () => this.CONSUME(lexer.Identifier)}
        ]);
    })

    private roundBrackets = this.RULE('roundBrackets', () => {
        this.CONSUME(lexer.OpenParenthesis);
        this.SUBRULE(this.expression);
        this.CONSUME(lexer.CloseParenthesis);
    })

    private squareBrackets = this.RULE('squareBrackets', () => {
        this.CONSUME(lexer.OpenSquareBracket);
        this.SUBRULE(this.expression);
        this.CONSUME(lexer.CloseSquareBracket);
    })

    private unaryOperator = this.RULE('unaryOperator', () => {
        this.OR([
            {ALT: () => this.CONSUME(lexer.Tilde)},
            {ALT: () => this.CONSUME(lexer.MinusSign)},
            {ALT: () => this.CONSUME(lexer.ExclamationMark)},
            {ALT: () => this.CONSUME(lexer.LessSigh)},
            {ALT: () => this.CONSUME(lexer.GreatherSign)}
        ]);
        this.SUBRULE(this.unaryOperatorValue);
    })

    private unaryOperatorValue = this.RULE('unaryOperatorValue', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.roundBrackets)},
            {ALT: () => this.SUBRULE(this.squareBrackets)},
            {ALT: () => this.CONSUME(lexer.StringLiteral)},
            {ALT: () => this.SUBRULE(this.number)},
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
