import { TextDocument } from 'vscode-languageserver-textdocument';
import {
	createConnection, DefinitionParams, InitializeParams, ReferenceParams, TextDocumentPositionParams, TextDocuments, TextDocumentSyncKind} from 'vscode-languageserver/node';
import { getNodeByPosition } from './ast/astUtil';
import { ParsedFiles } from './parsedFiles';
import { RelatedContextByNode } from './parser/ast/related';
import { Program } from './program';
import { validateLabels } from './validators/general';
import { DiagnosticWithURI } from './validators/util';

const connection = createConnection();
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const parsedFiles = new ParsedFiles(documents);
const openedDocuments = new Set<string>();
let lastSendedDiagnostics = new Set<string>();
let relatedObjects: RelatedContextByNode = new Map();

connection.onInitialize((_: InitializeParams) => {
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
	if (nodeByPosition)
		return relatedObjects.get(nodeByPosition);
}

documents.onDidOpen(event => {
	openedDocuments.add(event.document.uri);
	rescanDocuments();
});

documents.onDidChangeContent(_ => {
	rescanDocuments();
});

documents.onDidClose(change => {
	openedDocuments.delete(change.document.uri);
	rescanDocuments();
});

function rescanDocuments() {
	parsedFiles.clean();
	relatedObjects = new Map();
	const programs = Array.from(openedDocuments).map(uri => new Program(parsedFiles, uri));
	programs.forEach(program => {
		program.assemble();
		for (const node of program.relatedContexts.keys())
			relatedObjects.set(node, program.relatedContexts.get(node)!);
	});
	const usedFiles = new Set<string>(openedDocuments);
	const diagnostics: DiagnosticWithURI[] = [];
	for (const program of programs) {
		program.usedFiles.forEach(uri => usedFiles.add(uri));
		diagnostics.push(...validateLabels(program));
		diagnostics.push(...program.errors);
	}
	for (const usedFile of usedFiles)
		diagnostics.push(...parsedFiles.getFileDiagnostics(usedFile));
	const errorMap = new Map<string,DiagnosticWithURI[]>();
	for (const diagnostic of diagnostics) {
		let errorArray = errorMap.get(diagnostic.uri);
		if (!errorArray) {
			errorArray = [];
			errorMap.set(diagnostic.uri, errorArray);
		}
		errorArray.push(diagnostic);
	}
	const diagnosticsToDelete = lastSendedDiagnostics;
	lastSendedDiagnostics = new Set<string>();
	for (const errors of errorMap.values()) {
		const uri = errors[0].uri;
		connection.sendDiagnostics({uri, diagnostics: errors});
		diagnosticsToDelete.delete(uri);
		lastSendedDiagnostics.add(uri);
	}
	for (const uri of diagnosticsToDelete)
		connection.sendDiagnostics({uri, diagnostics: []});
}

documents.listen(connection);
connection.listen();
