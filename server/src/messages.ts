export enum MSG {
    UNKNOWN_COMMAND,
    WRONG_ADDRESS_MODE,
    NOT_IMPLIED_MODE,
    WRONG_IMMEDIATE,
    TOO_MANY_ARGUMENTS,
    NO_COMMAND_NAME,
    INVALID_NUMBER,
    LABEL_NOT_DEFINED,
    LABEL_AS_VAR_AND_CONSTANT,
    TOO_MANY_DEFINITIONS,
    INTERNAL_ERROR,
    STRING_LITERAL_EXPECTED,
    FILE_NOT_RESOLVABLE,
    CIRCULAR_INCLUDE,
    EMPTY_STRING,
    LEXING_ERROR_SOURCE,
    PARSING_ERROR_SOURCE,
    LIST_ARGS,
}

const EN: { [key in MSG]: string } = {
    [MSG.UNKNOWN_COMMAND]: 'Unknown opcode',
    [MSG.WRONG_ADDRESS_MODE]: 'Wrong address mode',
    [MSG.NOT_IMPLIED_MODE]: 'Implied mode is not available',
    [MSG.WRONG_IMMEDIATE]: 'Immediate mode is not available',
    [MSG.TOO_MANY_ARGUMENTS]: 'Too many arguments',
    [MSG.NO_COMMAND_NAME]: "Can't find command name",
    [MSG.INVALID_NUMBER]: "Invalid number",
    [MSG.LABEL_NOT_DEFINED]: "Label is not defined",
    [MSG.LABEL_AS_VAR_AND_CONSTANT]: "Label is defined as variable and as constant",
    [MSG.TOO_MANY_DEFINITIONS]: "Label is already defined",
    [MSG.INTERNAL_ERROR]: "extension internal error",
    [MSG.STRING_LITERAL_EXPECTED]: "String literal is expected here",
    [MSG.FILE_NOT_RESOLVABLE]: "The file is not resolvable",
    [MSG.CIRCULAR_INCLUDE]: "You have circular include",
    [MSG.EMPTY_STRING]: "Empty string is not allowed here",
    [MSG.LEXING_ERROR_SOURCE]: "lexer",
    [MSG.PARSING_ERROR_SOURCE]: "parser",
    [MSG.LIST_ARGS]: "Only ON or OFF allowed as args for 'list'",
};

export function getMessage(template: MSG): string {
    return EN[template];
}
