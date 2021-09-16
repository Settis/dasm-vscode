export default class AsmLine {
    readonly label?: Context;
    readonly command?: Context;
    readonly comment?: Context;
    readonly arguments?: Arguments;

    constructor(line: string) {
        const reg = /^(?<label>\S+)?\s*(?<command>\S+)?\s*(?<args>.*?)?\s*(;\s*(?<comment>.*?)\s*)?$/
        const result = reg.exec(line)?.groups;
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
            }
        }
    }
}

function constuctArguments(line: string, foundText?: string, position?: number) {
    
}

type Arguments = {
    range: Range,
    values: Context[]
}

type Context = {
    text: string,
    range: Range
}

type Range = {
    start: number,
    end: number
}