import * as fs from 'fs';
import { URI } from 'vscode-uri'
import * as path from 'path';

export function isExists(uri: string): boolean {
    const parsedUri = URI.parse(uri);
    if (parsedUri.scheme === 'file')
         return fs.existsSync(parsedUri.fsPath);
    return false;
}

export function readContent(uri: string): string | undefined {
    const parsedUri = URI.parse(uri);
    if (parsedUri.scheme === 'file') {
        try {
            return fs.readFileSync(parsedUri.fsPath, 'utf8');
        } catch (err) {
            return;
        }
    }
}

export function getFolder(uri: string): string {
    return URI.file(path.parse(URI.parse(uri).fsPath).dir).toString()
}
