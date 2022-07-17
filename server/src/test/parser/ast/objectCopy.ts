export function filterByMask(orig: any, mask: any): any {
    if (!orig) return orig;
    const result = {} as any;
    for (const name of Object.keys(mask)) {
        const maskField = mask[name];
        if (typeof maskField === 'object') {
            if (Array.isArray(maskField)) {
                if (typeof maskField[0] === 'object') {
                    const arrayResult = [];
                    const origField = orig[name] as [];
                    for (const i in origField)
                        arrayResult.push(filterByMask(origField[i], maskField[i] || {}));
                    result[name] = arrayResult;
                } else
                    result[name] = orig[name];
            } else
                result[name] = filterByMask(orig[name], maskField);
        } else 
            result[name] = orig[name];
    }
    return result;
}
