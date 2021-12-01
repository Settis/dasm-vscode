import { TextDocument } from 'vscode-languageserver-textdocument';
import { createConnection, InitializeParams, TextDocuments, TextDocumentSyncKind } from 'vscode-languageserver/node';
import { parseProgram } from './ast';
import { validateProgram } from './validators/general';

const connection = createConnection();
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental
		}
	};
});

documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

function validateTextDocument(textDocument: TextDocument) {
	const programNode = parseProgram(textDocument);
	const diagnostics = validateProgram(programNode);
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.onDidClose(change => {
	connection.sendDiagnostics({ uri: change.document.uri, diagnostics: []});
});

documents.listen(connection);
connection.listen();
