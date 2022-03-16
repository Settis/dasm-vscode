import * as fs from 'fs';

export function isExists(uri: string): boolean {
    if (uri.startsWith("file://"))
         return fs.existsSync(uri.substring(7));
    return false;
}

export function readContent(uri: string): string | undefined {
    if (uri.startsWith("file://")) {
        try {
            return fs.readFileSync(uri.substring(7), 'utf8');
        } catch (err) {
            return;
        }
    }
}