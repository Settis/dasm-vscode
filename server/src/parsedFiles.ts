import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver/node';
import { DiagnosticWithURI } from './validators/util';
import { readContent } from './localFiles';
import { FileNode } from './parser/ast/nodes';
import { parseText } from './parser/ast/utils';

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
        const fileRoot = parseText(document.uri, document.getText());
        this.cachedAst[uri] = fileRoot.ast;
        this.cachedErrors[uri] = fileRoot.errors;
        return fileRoot.ast;
    }

    public getFileDiagnostics(uri: string): DiagnosticWithURI[] {
        return this.cachedErrors[uri] || [];
    }
}
