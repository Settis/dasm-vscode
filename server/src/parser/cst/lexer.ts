import { createToken, Lexer } from "chevrotain";

const DEFAULT_MODE = 'defaultMode';
const MACROS_MODE = 'macrosMode';

export const Space = createToken({ name: 'space', pattern: /[ \f\t\v]+/ });
export const NonSpace = createToken({ name: 'nonSpace', pattern: /[^ \f\t\v\n]+/ });
export const Colon = createToken({ name: 'colon', pattern: /:/ });
export const Sharp = createToken({ name: 'sharp', pattern: /#/ });
export const Tilde = createToken({ name: 'tilde', pattern: /~/ });
export const MinusSign = createToken({ name: 'minusSign', pattern: /-/ });
export const ExclamationMark = createToken({ name: 'exclamationMark', pattern: /!/ });
export const LessSigh = createToken({ name: 'lessSign', pattern: /</ });
export const GreatherSign = createToken({ name: 'greatherSign', pattern: />/ });
export const MultiplicationSign = createToken({ name: 'multiplicationSign', pattern: /\*/ });
export const DivisionSign = createToken({ name: 'divisionSign', pattern: /\// });
export const PercentSign = createToken({ name: 'percentSign', pattern: /%/ });
export const AdditionSign = createToken({ name: 'additionSign', pattern: /\+/ });
export const ShiftRightSign = createToken({ name: 'shiftRightSign', pattern: />>/ });
export const ShiftLeftSign = createToken({ name: 'shiftLeftSign', pattern: /<</ });
export const GreatherOrEqualSign = createToken({ name: 'greatherOrEqualSign', pattern: />=/ });
export const LessOrEqualSign = createToken({ name: 'lessOrEqualSign', pattern: /<=/ });
export const EqualSign = createToken({ name: 'equalSigh', pattern: /==/ });
export const NotEqualSign = createToken({ name: 'notEqualSign', pattern: /!=/ });
export const AssignSign = createToken({ name: 'assignSign', pattern: /=/ });
export const ArithmeticAndSign = createToken({ name: 'arithmeticAndSign', pattern: /&/ });
export const XorSign = createToken({ name: 'xorSign', pattern: /\^/ });
export const ArithmeticOrSign = createToken({ name: 'arithmeticOrSign', pattern: /\|/ });
export const LogicalAndSign = createToken({ name: 'logicalAndSign', pattern: /&&/ });
export const LogicalOrSign = createToken({ name: 'logicalOrSign', pattern: /\|\|/ });
export const QuestionMark = createToken({ name: 'questionMark', pattern: /\?/ });
export const Comma = createToken({ name: 'comma', pattern: /,/ });
export const OpenParenthesis = createToken({ name: 'openParenthesis', pattern: /\(/ });
export const CloseParenthesis = createToken({ name: 'closeParenthesis', pattern: /\)/ });
export const OpenSquareBracket = createToken({ name: 'openSquareBracket', pattern: /\[/ });
export const CloseSquareBracket = createToken({ name: 'closeSquareBracket', pattern: /\]/ });
export const OpenCurlyBracket = createToken({ name: 'openCurlyBracket', pattern: /{/ });
export const CloseCurlyBracket = createToken({ name: 'closeCurlyBracket', pattern: /}/ });
export const DynamicLabelSeparator = createToken({ name: 'dynamicLabelSeparator', pattern: /<\/>/});

export const BinaryNumber = createToken({ name: 'binaryNumber', pattern: /%[01]+/ });
export const OctalNumber = createToken({ name: 'octalNumber', pattern: /0[0-7]+/ });
export const DecimalNumber = createToken({ name: 'decimalNumber', pattern: /\d+/ });
export const HexadecimalNumber = createToken({ name: 'hexadecimalNumber', pattern: /\$[\dA-Fa-f]+/ });

export const AddressXEnding = createToken({ name: 'addressXEnding', pattern: /,[Xx]\b/ });
export const AddressYEnding = createToken({ name: 'addressYEnding', pattern: /,[Yy]\b/ });
export const IndirectXEnding = createToken({ name: 'indirectXEnding', pattern: /,[Xx]\)/ });
export const IndirectYEnding = createToken({ name: 'indirectYEnding', pattern: /\),[Yy]\b/ });

export const Identifier = createToken({ name: 'identifier', pattern: /[.\w]+/ });

export const IfConstKeyword = createToken({ name: 'ifConstKeyword', pattern: /ifconst\b/i });
export const IfNConstKeyword = createToken({ name: 'ifNConstKeyword', pattern: /ifnconst\b/i });
export const IfKeyword = createToken({ name: 'ifKeyword', pattern: /if\b/i });
export const ElseKeyword = createToken({ name: 'elseKeyword', pattern: /else\b/i });
export const EndIfKeyword = createToken({ name: 'endIfKeyword', pattern: /e(nd)?if\b/i });
export const RepeatKeyword = createToken({ name: 'repeatKeyword', pattern: /repeat\b/i });
export const RependKeyword = createToken({ name: 'rependKeyword', pattern: /repend\b/i });
export const MacroKeyword = createToken({ name: 'macroKeyword', pattern: /mac(ro)?\b/i, push_mode: MACROS_MODE });
export const RestrictedMacroKeyword = createToken({ name: 'restrictedMacroKeyword', pattern: /mac(ro)?\b/i });
export const EndMacroKeyword = createToken({ name: 'endMacroKeyword', pattern: /endm\b/i, pop_mode: true });

export const HexLine = createToken({ name: 'hexLine', pattern: /hex [^\n\r]*/i, group: Lexer.SKIPPED });

export const DecimalFormatFlag = createToken({ name: 'decimalFormatFlag', pattern: /d/, longer_alt: Identifier });

export const NewLineSeparator = createToken({ name: 'newLineSeprarator', pattern: /\n|\r\n?/, line_breaks: true });
export const Comment = createToken({ name: 'comment', pattern: /;[^\n\r]*/, group: Lexer.SKIPPED });
export const MultilineComment = createToken({ name: 'multilineComment', pattern: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//, group: Lexer.SKIPPED, line_breaks: true });

export const StringLiteral = createToken({ name: 'stringLiteral', pattern: /"[^"]*"/ });
export const CharLiteral = createToken({ name: 'charLiteral', pattern: /'./ });

export const LEXER_DEFINITION = {
    modes: {
        [DEFAULT_MODE]: [
            MultilineComment,

            DynamicLabelSeparator,
            Space,
            Colon,
            Sharp,
            Tilde,
            MinusSign,
            EqualSign,
            NotEqualSign,
            AssignSign,
            ExclamationMark,
            GreatherOrEqualSign,
            LessOrEqualSign,
            ShiftRightSign,
            ShiftLeftSign,
            LessSigh,
            GreatherSign,
            MultiplicationSign,
            DivisionSign,
            AdditionSign,
            XorSign,
            LogicalAndSign,
            LogicalOrSign,
            ArithmeticAndSign,
            ArithmeticOrSign,
            QuestionMark,
        
            IndirectXEnding,
            IndirectYEnding,
            AddressXEnding,
            AddressYEnding,
            OpenParenthesis,
            CloseParenthesis,
            OpenSquareBracket,
            CloseSquareBracket,
            OpenCurlyBracket,
            CloseCurlyBracket,
            
            Comma,
        
            BinaryNumber,
            OctalNumber,
            DecimalNumber,
            HexadecimalNumber,
        
            PercentSign,
        
            IfConstKeyword,
            IfNConstKeyword,
            IfKeyword,
            ElseKeyword,
            EndIfKeyword,
            RepeatKeyword,
            RependKeyword,
            MacroKeyword,
        
            HexLine,
        
            DecimalFormatFlag,
            Identifier,
        
            NewLineSeparator,
            Comment,
            StringLiteral,
            CharLiteral,
        ],
        [MACROS_MODE]: [
            EndMacroKeyword,
            RestrictedMacroKeyword,
            Space,
            NewLineSeparator,
            NonSpace,
        ],
    },
    defaultMode: DEFAULT_MODE
};

export const DASM_LEXER = new Lexer(LEXER_DEFINITION, {
    positionTracking: 'full'
});
