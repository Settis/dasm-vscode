export function isNumber(text: string): boolean {
    return /^[\d$%]/.test(text);
}

export function parseNumber(text: string) {
    let base = 10;
    let regex = /^\d+$/;
    if (text.startsWith('0')) {
        base = 8;
        regex = /^[0-7]+$/;
    } else if (text.startsWith('%')) {
        base = 2;
        text = text.substr(1);
        regex = /^[01]+$/;
    } else if (text.startsWith('$')) {
        base = 16;
        text = text.substr(1);
        regex = /^[\dA-Fa-f]+$/;
    }
    if (!regex.test(text)) return Number.NaN;
    return parseInt(text, base);
}