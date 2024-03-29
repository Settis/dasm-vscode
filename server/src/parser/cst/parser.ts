import { CstParser } from "chevrotain";
import { TextCstNode } from "./cstTypes";
import * as lexer from "./lexer";

const SET_OF_BINARY_SIGNS = new Set([
    lexer.MultiplicationSign,
    lexer.DivisionSign,
    lexer.PercentSign,
    lexer.AdditionSign,
    lexer.MinusSign,
    lexer.ShiftRightSign,
    lexer.ShiftLeftSign,
    lexer.GreatherSign,
    lexer.GreatherOrEqualSign,
    lexer.LessSigh,
    lexer.LessOrEqualSign,
    lexer.EqualSign,
    lexer.AssignSign,
    lexer.NotEqualSign,
    lexer.ArithmeticAndSign,
    lexer.XorSign,
    lexer.ArithmeticOrSign,
    lexer.LogicalAndSign,
    lexer.LogicalOrSign,
    lexer.QuestionMark,
]);

class DasmParser extends CstParser {
    constructor() {
        super(lexer.LEXER_DEFINITION, {
            nodeLocationTracking: "full",
            recoveryEnabled: true
        });
        this.performSelfAnalysis();
    }

    public text = this.RULE('text', () => {
        this.MANY_SEP({
            SEP: lexer.NewLineSeparator,
            DEF: () => this.SUBRULE(this.line)
        });
    }) as () => TextCstNode;

    private line = this.RULE('line', () => {
        this.OPTION1(() => this.SUBRULE(this.label));
        this.OPTION2(() => {
            this.CONSUME1(lexer.Space);
            this.SUBRULE(this.command);
        });
        this.OPTION3(() => this.CONSUME(lexer.Space));
    })

    private label = this.RULE('label', () => {
        this.SUBRULE(this.dynamicLabelDefinition);
        this.OPTION(() => this.CONSUME(lexer.Colon));
    })

    private dynamicLabelDefinition = this.RULE('dynamicLabelDefinition', () => {
        this.AT_LEAST_ONE_SEP({
            SEP: lexer.Comma,
            DEF: () => { 
                this.OR([
                    {ALT: () => this.CONSUME(lexer.Identifier)},
                    {ALT: () => this.CONSUME(lexer.StringLiteral)}
                ]);
            }
        });
    })

    private command = this.RULE('command', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.ifCommand)},
            {ALT: () => this.SUBRULE(this.repeatCommand)},
            {ALT: () => this.SUBRULE(this.macroCommand)},
            {ALT: () => this.SUBRULE(this.includeCommand)},
            {ALT: () => this.SUBRULE(this.generalCommand)}
        ]);
    })

    private ifCommand = this.RULE('ifCommand', () => {
        this.OR([
            {ALT: () => this.CONSUME(lexer.IfConstKeyword)},
            {ALT: () => this.CONSUME(lexer.IfNConstKeyword)},
            {ALT: () => this.CONSUME(lexer.IfKeyword)}
        ]);
        this.CONSUME1(lexer.Space);
        this.SUBRULE(this.expression);
        this.SUBRULE1(this.text);
        this.OPTION(() => {
            this.CONSUME(lexer.ElseKeyword);
            this.SUBRULE2(this.text);
        });
        this.CONSUME(lexer.EndIfKeyword);
    })

    private repeatCommand = this.RULE('repeatCommand', () => {
        this.CONSUME(lexer.RepeatKeyword);
        this.CONSUME1(lexer.Space);
        this.SUBRULE(this.expression);
        this.SUBRULE(this.text);
        this.CONSUME(lexer.RependKeyword);
    })

    private macroCommand = this.RULE('macroCommand', () => {
        this.CONSUME(lexer.MacroKeyword);
        this.CONSUME1(lexer.Space);
        this.CONSUME(lexer.NonSpace);
        this.SUBRULE(this.macroText);
        this.CONSUME(lexer.EndMacroKeyword);
    })

    private macroText = this.RULE('macroText', () => {
        this.MANY(() => {
            this.SUBRULE(this.macroTextPart);
        });
    })

    private macroTextPart = this.RULE('macroTextPart', () => {
        this.OR([
            {ALT: () => this.CONSUME(lexer.NewLineSeparator)},
            {ALT: () => this.CONSUME(lexer.Space)},
            {ALT: () => this.CONSUME(lexer.NonSpace)},
        ]);
    })

    private includeCommand = this.RULE('includeCommand', () => {
        this.OR1([
            {ALT: () => this.CONSUME(lexer.IncludeKeyword)},
            {ALT: () => this.CONSUME(lexer.IncbinKeyword)},
            {ALT: () => this.CONSUME(lexer.IncdirKeyword)},
        ]);
        this.CONSUME(lexer.Space);
        this.OR2([
            {ALT: () => this.CONSUME(lexer.StringLiteral)},
            {ALT: () => this.SUBRULE(this.filePath)},
        ]);
    })

    private filePath = this.RULE('filePath', () => {
        this.AT_LEAST_ONE_SEP({
            SEP: lexer.DivisionSign,
            DEF: () => this.CONSUME(lexer.Identifier)
        });
    })

    private generalCommand = this.RULE('generalCommand', () => {
        this.SUBRULE(this.commandName);
        this.MANY_SEP({
            SEP: lexer.Comma,
            DEF: () => {
                this.OPTION1(() => this.CONSUME1(lexer.Space));
                this.SUBRULE(this.argument);
                this.OPTION2(() => this.CONSUME2(lexer.Space));
            }
        });
        this.OPTION3(() => this.CONSUME3(lexer.Space));
    })

    private commandName = this.RULE('commandName', () => {
        this.OR([
            {ALT: () => this.CONSUME(lexer.AssignSign)},
            {ALT: () => this.CONSUME(lexer.Identifier)}
        ]);
    })

    private argument = this.RULE('argument', () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.immediateArgument)},
            {
                GATE: () => this.LA(1).tokenType !== lexer.OpenParenthesis,
                ALT: () => this.SUBRULE(this.addressXYArgument)},
            {
                GATE: () => this.LA(1).tokenType === lexer.OpenParenthesis,
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
        this.MANY({
            GATE: () => this.isBinarySignNearby(),
            DEF: () => {
                this.OPTION1(() => this.CONSUME1(lexer.Space));
                this.SUBRULE(this.binarySign);
                this.OPTION2(() => this.CONSUME2(lexer.Space));
                this.SUBRULE2(this.unaryExpression);
            }
        });
    })

    private isBinarySignNearby() {
        return SET_OF_BINARY_SIGNS.has(this.LA(1).tokenType)
            || SET_OF_BINARY_SIGNS.has(this.LA(2).tokenType);
    }

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
            {ALT: () => this.CONSUME(lexer.AssignSign)},
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
            {ALT: () => this.CONSUME(lexer.Identifier)},
            {ALT: () => this.CONSUME(lexer.MultiplicationSign)},
            {ALT: () => this.SUBRULE(this.macroArgument)},
            {ALT: () => this.CONSUME(lexer.CharLiteral)},
        ]);
    })

    private roundBrackets = this.RULE('roundBrackets', () => {
        this.CONSUME(lexer.OpenParenthesis);
        this.OPTION1(() => this.CONSUME1(lexer.Space));
        this.SUBRULE(this.expression);
        this.OPTION2(() => this.CONSUME2(lexer.Space));
        this.CONSUME(lexer.CloseParenthesis);
    })

    private squareBrackets = this.RULE('squareBrackets', () => {
        this.CONSUME(lexer.OpenSquareBracket);
        this.OPTION1(() => this.CONSUME1(lexer.Space));
        this.SUBRULE(this.expression);
        this.OPTION2(() => this.CONSUME2(lexer.Space));
        this.CONSUME(lexer.CloseSquareBracket);
        this.OPTION(() => this.CONSUME(lexer.DecimalFormatFlag));
    })

    private unaryOperator = this.RULE('unaryOperator', () => {
        this.OR([
            {ALT: () => this.CONSUME(lexer.Tilde)},
            {ALT: () => this.CONSUME(lexer.MinusSign)},
            {ALT: () => this.CONSUME(lexer.ExclamationMark)},
            {ALT: () => this.CONSUME(lexer.LessSigh)},
            {ALT: () => this.CONSUME(lexer.GreatherSign)}
        ]);
        this.OPTION(() => this.CONSUME(lexer.Space));
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

    private macroArgument = this.RULE('macroArgument', () => {
        this.CONSUME(lexer.OpenCurlyBracket);
        this.CONSUME(lexer.DecimalNumber);
        this.CONSUME(lexer.CloseCurlyBracket);
    })
}

export const DASM_PARSER = new DasmParser();
