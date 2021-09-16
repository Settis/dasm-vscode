type AsmLine = {
    readonly label?: Context;
    readonly command?: Context;
    readonly comment?: Context;
    readonly arguments: Context[];
}

export default function parseAsmLine(line: string): AsmLine  {
    const commentReg = /^(?<code>[^;]*)?(;\s*(?<comment>.*?)\s*)?$/;
    const commentRegResult = commentReg.exec(line)!.groups;
    const comment = constructContext(line, commentRegResult?.comment, line.indexOf(';'));
    const codeString = commentRegResult?.code;
    const args: Context[] = [];
    if (!codeString) return {
        comment: comment,
        arguments: args,
        command: undefined,
        label: undefined
    };
    const words = codeString.split(/\s+/);
    const label = constructContext(codeString, words[0]);
    const command = constructContext(codeString, words[1], label?.range?.end);
    let lastIndex = command?.range?.end;
    for (let index = 2 ;index < words.length ;index++) {
        const argContext = constructContext(codeString, words[index], lastIndex);
        lastIndex = argContext?.range?.end;
        if (argContext)
            args.push(argContext);
    }
    return {
        label: label,
        command: command,
        comment: comment,
        arguments: args
    };
}

function constructContext(line: string, foundText?: string, position?: number) {
    if (foundText) {
        const start = line.indexOf(foundText, position);
        if (start != -1) {
            return {
                text: foundText,
                range: {
                    start: start,
                    end: start + foundText.length
                }
            };
        }
    }
}

export type Context = {
    readonly text: string,
    readonly range: Range
}

export type Range = {
    readonly start: number,
    readonly end: number
}