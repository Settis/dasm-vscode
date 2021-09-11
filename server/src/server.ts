import { TextDocument } from 'vscode-languageserver-textdocument';
import {
	createConnection, Diagnostic, DiagnosticSeverity, InitializeParams, TextDocuments, TextDocumentSyncKind
} from 'vscode-languageserver/node';

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
	const text = textDocument.getText();
	const pattern = /\b[A-Z]{2,}\b/g;
	let m: RegExpExecArray | null;
	const diagnostics: Diagnostic[] = [];
	while ((m = pattern.exec(text))) {
		diagnostics.push({
			severity: DiagnosticSeverity.Warning,
			range: {
				start: textDocument.positionAt(m.index),
				end: textDocument.positionAt(m.index + m[0].length)
			},
			message: `${m[0]} is all uppercase.`,
			source: 'ex'
		});
	}
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.listen(connection);
connection.listen();
