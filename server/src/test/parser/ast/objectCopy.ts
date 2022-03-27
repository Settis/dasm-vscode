export function copy(orig: any, mask: any): any {
    const result = {} as any;
    for (const name of Object.keys(mask)) {
        const maskField = mask[name];
        if (typeof maskField === 'object') {
            if (Array.isArray(maskField)) {
                if (typeof maskField[0] === 'object') {
                    const arrayResult = [];
                    for (const item of orig[name])
                        arrayResult.push(copy(item, maskField[0]));
                    result[name] = arrayResult;
                } else
                    result[name] = orig[name];
            } else
                result[name] = copy(orig[name], maskField);
        } else 
            result[name] = orig[name];
    }
    return result;
}
