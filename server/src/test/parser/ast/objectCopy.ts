export function filterByMask(orig: any, mask: any): any {
    if (!orig) return orig;
    const result = {} as any;
    for (const name of Object.keys(mask)) {
        result[name] = getFieldByMask(orig[name], mask[name]);
    }
    return result;
}

function getFieldByMask(originalField: any, fieldMask: any): any {
    if (typeof fieldMask === 'object')
        if (Array.isArray(fieldMask))
            return getArrayFieldByMack(originalField, fieldMask);
        else
            return filterByMask(originalField, fieldMask);
    else
        return originalField;
}

function getArrayFieldByMack(originalField: any[], fieldMask: any[]): any[] {
    if (typeof fieldMask[0] === 'object') {
        const arrayResult = [];
        for (const i in originalField)
            arrayResult.push(filterByMask(originalField[i], fieldMask[i] || {}));
        return arrayResult;
    } else
        return originalField;
}
