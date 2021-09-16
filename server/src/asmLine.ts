export default class AsmLine {
    readonly label?: Context;
    readonly command?: Context;
    readonly comment?: Context;
    readonly arguments: Context[] = [];

    constructor(line: string) {
        const commentReg = /^(?<code>[^;]*)?(;\s*(?<comment>.*?)\s*)?$/;
        const commentRegResult = commentReg.exec(line)!.groups;
        this.comment = constructContext(line, commentRegResult?.comment, line.indexOf(';'));
        const codeString = commentRegResult?.code;
        if (!codeString) return;
        const words = codeString.split(/\s+/);
        this.label = constructContext(codeString, words[0]);
        this.command = constructContext(codeString, words[1], this.label?.range?.end);
        let lastIndex = this.command?.range?.end;
        for (let index = 2 ;index < words.length ;index++) {
            const argContext = constructContext(codeString, words[index], lastIndex);
            lastIndex = argContext?.range?.end;
            if (argContext)
                this.arguments.push(argContext);
        }
    }
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

type Context = {
    text: string,
    range: Range
}

type Range = {
    start: number,
    end: number
}