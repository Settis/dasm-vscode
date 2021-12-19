import { TextDocument } from 'vscode-languageserver-textdocument';
import {
	createConnection, DefinitionParams, InitializeParams, ReferenceParams, TextDocumentPositionParams, TextDocuments, TextDocumentSyncKind} from 'vscode-languageserver/node';
import { assembleProgram } from './assemblers/assemble';
import { parseProgram, ProgramNode } from './ast';
import { getNodeByPosition } from './astUtil';
import { validateProgram } from './validators/general';

const connection = createConnection();
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const programs: { [key: string]: ProgramNode } = {};

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
	const programNode = programs[params.textDocument.uri];
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
	const programNode = parseProgram(textDocument);
	assembleProgram(programNode);
	programs[textDocument.uri] = programNode;
	const diagnostics = validateProgram(programNode);
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.onDidClose(change => {
	connection.sendDiagnostics({ uri: change.document.uri, diagnostics: []});
});

documents.listen(connection);
connection.listen();
