import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver/node';
import { DiagnosticWithURI } from './validators/util';
import { validateNode } from './validators/general';
import { parseFile } from './ast/construct';
import { FileNode } from './ast/nodes';
import { readContent } from './localFiles';

export class ParsedFiles {
    private cachedAst: { [index: string]: FileNode } = {}
    private cachedErrors: { [index: string]: DiagnosticWithURI[] } = {}

    constructor(private documents: TextDocuments<TextDocument>) {}

    public clean() {
        this.cachedAst = {};
        this.cachedErrors = {};
    }

    public deleteUri(uri: string) {
        delete this.cachedAst[uri];
        delete this.cachedErrors[uri]; 
    }

    public getFileAst(uri: string): FileNode | undefined {
        const cachedRoot = this.cachedAst[uri];
        if (cachedRoot) return cachedRoot;
        let document = this.documents.get(uri);
        if (!document) {
            const data = readContent(uri);
            if (!data) return;
            document = TextDocument.create(uri, "dasm", 1, data);
        }
        const fileRoot = parseFile(document);
        this.cachedAst[uri] = fileRoot;
        this.cachedErrors[uri] = validateNode(fileRoot);
        return fileRoot;
    }

    public getFileDiagnostics(uri: string): DiagnosticWithURI[] {
        return this.cachedErrors[uri] || [];
    }
}