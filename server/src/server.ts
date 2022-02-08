import { TextDocument } from 'vscode-languageserver-textdocument';
import {
	createConnection, DefinitionParams, InitializeParams, ReferenceParams, TextDocumentPositionParams, TextDocuments, TextDocumentSyncKind} from 'vscode-languageserver/node';
import { getNodeByPosition } from './ast/astUtil';
import { ParsedFiles } from './parsedFiles';
import { Program } from './program';
import { validateLabels } from './validators/general';

const connection = createConnection();
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const parsedFiles = new ParsedFiles(documents);

connection.onInitialize((params: InitializeParams) => {
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			definitionProvider: true,
			referencesProvider: true,
		}
	};
});

connection.onDefinition((params: DefinitionParams) => {
	return getRelatedObject(params)?.definitions.map(it => it.location);
});

connection.onReferences((params: ReferenceParams) => {
	return getRelatedObject(params)?.usages.map(it => it.location);
});

function getRelatedObject(params: TextDocumentPositionParams) {
	const programNode = parsedFiles.getFileAst(params.textDocument.uri);
	if (programNode === undefined) return;
	const nodeByPosition = getNodeByPosition(programNode, {
		...params.position,
		uri: params.textDocument.uri
	});
	if (nodeByPosition !== undefined && "relatedObject" in nodeByPosition) {
		return nodeByPosition.relatedObject;
	}
}

documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

function validateTextDocument(textDocument: TextDocument) {
	const program = new Program(parsedFiles, textDocument.uri);
	program.assemble();
	const diagnostics = [];
	diagnostics.push(...parsedFiles.getFileDiagnostics(textDocument.uri));
	diagnostics.push(...validateLabels(program));
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.onDidClose(change => {
	connection.sendDiagnostics({ uri: change.document.uri, diagnostics: []});
});

documents.listen(connection);
connection.listen();
