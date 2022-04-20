import { createToken, Lexer } from "chevrotain";

export const Space = createToken({ name: 'space', pattern: /[ \f\t\v]+/ });
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

export const BinaryNumber = createToken({ name: 'binaryNumber', pattern: /%[01]+/ });
export const OctalNumber = createToken({ name: 'octalNumber', pattern: /0[0-7]+/ });
export const DecimalNumber = createToken({ name: 'decimalNumber', pattern: /\d+/ });
export const HexadecimalNumber = createToken({ name: 'hexadecimalNumber', pattern: /\$[\dA-Fa-f]+/ });

export const AddressXEnding = createToken({ name: 'addressXEnding', pattern: /,[Xx]\b/ });
export const AddressYEnding = createToken({ name: 'addressYEnding', pattern: /,[Yy]\b/ });
export const IndirectXEnding = createToken({ name: 'indirectXEnding', pattern: /,[Xx]\)/ });
export const IndirectYEnding = createToken({ name: 'indirectYEnding', pattern: /\),[Yy]\b/ });

export const Identifier = createToken({ name: 'identifier', pattern: /\.?\w+/ });
export const TripleDots = createToken({ name: 'tripleDots', pattern: /\.\.\./ });
export const DoubleDots = createToken({ name: 'doubleDots', pattern: /\.\./ });
export const Dot = createToken({ name: 'dot', pattern: /\./ });

export const IfConstKeyword = createToken({ name: 'ifConstKeyword', pattern: /ifconst/i });
export const IfNConstKeyword = createToken({ name: 'ifNConstKeyword', pattern: /ifnconst/i });
export const IfKeyword = createToken({ name: 'ifKeyword', pattern: /if/i });
export const ElseKeyword = createToken({ name: 'elseKeyword', pattern: /else/i });
export const EndIfKeyword = createToken({ name: 'endIfKeyword', pattern: /e(nd)?if/i });
export const RepeatKeyword = createToken({ name: 'repeatKeyword', pattern: /repeat/i });
export const RependKeyword = createToken({ name: 'rependKeyword', pattern: /repend/i });
export const MacroKeyword = createToken({ name: 'macroKeyword', pattern: /mac(ro)?/i });
export const EndMacroKeyword = createToken({ name: 'endMacroKeyword', pattern: /endm/i });

export const HexLine = createToken({ name: 'hexLine', pattern: /hex [^\n\r]*/i, group: Lexer.SKIPPED });

export const ImpliedExtension = createToken({ name: 'impliedExtension', pattern: /\.(0|i)/i, longer_alt: Identifier });
export const ImpliedIndexingXExtension = createToken({ name: 'impliedIndexingXExtension', pattern: /\.0x/i, longer_alt: Identifier });
export const ImpliedIndexingYExtension = createToken({ name: 'impliedIndexingYExtension', pattern: /\.0y/i, longer_alt: Identifier });
export const AbsoluteExtension = createToken({ name: 'absoluteExtension', pattern: /\.a/i, longer_alt: Identifier });
export const ByteExtension = createToken({ name: 'byteExtension', pattern: /\.b/i, longer_alt: Identifier });
export const ByteXExtension = createToken({ name: 'byteXExtension', pattern: /\.bx/i, longer_alt: Identifier });
export const ByteYExtension = createToken({ name: 'byteYExtension', pattern: /\.by/i, longer_alt: Identifier });
export const DirectExtension = createToken({ name: 'directExtension', pattern: /\.d/i, longer_alt: Identifier });
export const ExtendedExtension = createToken({ name: 'extendedExtension', pattern: /\.e/i, longer_alt: Identifier });
export const IndirectExtension = createToken({ name: 'indirectExtension', pattern: /\.ind/i, longer_alt: Identifier });
export const LongExtension = createToken({ name: 'longExtension', pattern: /\.l/i, longer_alt: Identifier });
export const RelativeExtension = createToken({ name: 'relativeExtension', pattern: /\.r/i, longer_alt: Identifier });
export const UninitializedExtension = createToken({ name: 'uninitializedExtension', pattern: /\.u/i, longer_alt: Identifier });
export const WordExtension = createToken({ name: 'wordExtension', pattern: /\.w/i, longer_alt: Identifier });
export const WordXExtension = createToken({ name: 'wordXExtension', pattern: /\.wx/i, longer_alt: Identifier });
export const WordYExtension = createToken({ name: 'wordYExtension', pattern: /\.wy/i, longer_alt: Identifier });
export const ZeroPageExtension = createToken({ name: 'zeroPageExtension', pattern: /\.z/i, longer_alt: Identifier });

export const DecimalFormatFlag = createToken({ name: 'decimalFormatFlag', pattern: /d/, longer_alt: Identifier });

export const NewLineSeparator = createToken({ name: 'newLineSeprarator', pattern: /\n|\r\n?/ });
export const Comment = createToken({ name: 'comment', pattern: /;[^\n\r]*/, group: Lexer.SKIPPED });
export const MultilineComment = createToken({ name: 'multilineComment', pattern: /\/\*.*\*\//, group: Lexer.SKIPPED });

export const StringLiteral = createToken({ name: 'stringLiteral', pattern: /"[^"]*"/ });
export const CharLiteral = createToken({ name: 'charLiteral', pattern: /'./ });

export const ALL_TOKENS = [
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
    EndMacroKeyword,

    HexLine,

    ImpliedExtension,
    ImpliedIndexingXExtension,
    ImpliedIndexingYExtension,
    AbsoluteExtension,
    ByteExtension,
    ByteXExtension,
    ByteYExtension,
    DirectExtension,
    ExtendedExtension,
    IndirectExtension,
    LongExtension,
    RelativeExtension,
    UninitializedExtension,
    WordExtension,
    WordXExtension,
    WordYExtension,
    ZeroPageExtension,
    DecimalFormatFlag,
    TripleDots,
    DoubleDots,
    Identifier,
    Dot,

    NewLineSeparator,
    Comment,
    MultilineComment,
    StringLiteral,
    CharLiteral
];

export const DASM_LEXER = new Lexer(ALL_TOKENS, {
    positionTracking: 'full'
});
