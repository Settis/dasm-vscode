import { TextDocument } from 'vscode-languageserver-textdocument';
import {
	createConnection, DefinitionParams, InitializeParams, ReferenceParams, TextDocumentPositionParams, TextDocuments, TextDocumentSyncKind} from 'vscode-languageserver/node';
import { ParsedFiles } from './parsedFiles';
import { LabelsByName } from './parser/ast/labels';
import { MacrosByName } from './parser/ast/macros';
import { BasicNode } from './parser/ast/nodes';
import { getNodeByPosition } from './parser/ast/utils';
import { Program } from './program';
import { validateProgram } from './validators/general';
import { DiagnosticWithURI } from './validators/util';

type RelatedObject = {
    definitions: BasicNode[],
    usages: BasicNode[]
}

const connection = createConnection();
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const parsedFiles = new ParsedFiles(documents);
const openedDocuments = new Set<string>();
let lastSendedDiagnostics = new Set<string>();
let relatedObjects = new Map<BasicNode, RelatedObject>();

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
		collectLabels(program.globalLabels);
		program.localLabels.forEach(it => collectLabels(it));
		collectMacros(program.macroses);
	});
	const usedFiles = new Set<string>(openedDocuments);
	const diagnostics: DiagnosticWithURI[] = [];
	for (const program of programs) {
		program.usedFiles.forEach(uri => usedFiles.add(uri));
		diagnostics.push(...validateProgram(program));
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

function collectLabels(labelsMap: LabelsByName) {
	for (const label of labelsMap.values()) {
		for (const definition of label.definitions)
			relatedObjects.set(definition, label);
		for (const usage of label.usages)
			relatedObjects.set(usage, label);
	}
}

function collectMacros(macrosMap: MacrosByName) {
	for (const macro of macrosMap.values()) {
		for (const definition of macro.definitions)
			relatedObjects.set(definition, macro);
		for (const usage of macro.usages)
			relatedObjects.set(usage, macro);
	}
}

documents.listen(connection);
connection.listen();
