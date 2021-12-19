export enum MSG {
    UNKNOWN_COMMAND,
    WRONG_ADDRESS_MODE,
    NOT_IMPLIED_MODE,
    WRONG_IMMEDIATE,
    TOO_MANY_ARGUMENTS,
    NO_COMMAND_NAME,
    INVALID_NUMBER,
    LABEL_NOT_DEFINED,
    TOO_MANY_DEFINITIONS,
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
    [MSG.TOO_MANY_DEFINITIONS]: "Label is already defined",
};

export function getMessage(template: MSG): string {
    return EN[template];
}
