import { TextDocument } from 'vscode-languageserver-textdocument';
import {
	createConnection, DefinitionParams, HoverParams, InitializeParams, ReferenceParams, TextDocumentPositionParams, TextDocuments, TextDocumentSyncKind} from 'vscode-languageserver/node';
import { onCompletionImpl, onCompletionResolveImpl } from './completion/basic';
import { getHover } from './hovering/basic';
import { ParsedFiles } from './parsedFiles';
import { LabelsByName } from './parser/ast/labels';
import { MacrosByName } from './parser/ast/macros';
import { AstNode } from './parser/ast/nodes';
import { getNodeByPosition } from './parser/ast/utils';
import { Program } from './program';
import { validateProgram } from './validators/general';
import { DiagnosticWithURI } from './validators/util';
import { DEFAULT_SETTINGS, Settings } from './settings';

type RelatedObject = {
    definitions: AstNode[],
    usages: AstNode[]
}

export const connection = createConnection();
export const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
export const parsedFiles = new ParsedFiles(documents);
export const documentSettings: Map<string, Settings> = new Map();
const openedDocuments = new Set<string>();
let lastSendedDiagnostics = new Set<string>();
let relatedObjects = new Map<AstNode, RelatedObject>();
export let programs = new Map<string, Program>();

connection.onInitialize((_: InitializeParams) => {
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			definitionProvider: true,
			referencesProvider: true,
			hoverProvider: true,
			completionProvider: { resolveProvider: true }
		}
	};
});

connection.onDefinition((params: DefinitionParams) => {
	return getRelatedObject(params)?.definitions.map(it => it.location);
});

connection.onReferences((params: ReferenceParams) => {
	return getRelatedObject(params)?.usages.map(it => it.location);
});

function getNodeByDocumentPosition(params: TextDocumentPositionParams) {
	const programNode = parsedFiles.getFileAst(params.textDocument.uri);
	if (programNode === undefined) return;
	return getNodeByPosition(programNode, {
		...params.position,
		uri: params.textDocument.uri
	});
}

function getRelatedObject(params: TextDocumentPositionParams) {
	const nodeByPosition = getNodeByDocumentPosition(params);
	if (nodeByPosition)
		return relatedObjects.get(nodeByPosition[0]);
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
	documentSettings.delete(change.document.uri);
	rescanDocuments();
});

connection.onHover((params: HoverParams) => {
	const nodes = getNodeByDocumentPosition(params);
	if (nodes) return getHover(nodes);
	return null;
});

connection.onCompletion(onCompletionImpl);
connection.onCompletionResolve(onCompletionResolveImpl);

connection.onDidChangeConfiguration(_ => {
	documentSettings.clear();
});

export async function getDocumentSettings(resource: string): Promise<Settings> {
	let result = documentSettings.get(resource);
	if (!result) {
		result = await connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'dasm'
		});
		if (!result) result = DEFAULT_SETTINGS;
		documentSettings.set(resource, result);
	}
	return result;
}

function rescanDocuments() {
	parsedFiles.clean();
	relatedObjects = new Map();
	programs = new Map();
	Array.from(openedDocuments).forEach(uri => programs.set(uri, new Program(parsedFiles, uri)));
	const programList = Array.from(programs.values());
	programList.forEach(program => {
		program.assemble();
		collectLabels(program.globalLabels);
		program.localLabels.forEach(it => collectLabels(it));
		collectMacros(program.macroses);
	});
	const usedFiles = new Set<string>();
	const diagnostics: DiagnosticWithURI[] = [];
	for (const program of programList) {
		program.usedFiles.forEach(uri => usedFiles.add(uri));
	}
	for (const program of programList) {
		if (usedFiles.has(program.uri)) continue;
		diagnostics.push(...validateProgram(program));
		diagnostics.push(...program.errors);
	}
	openedDocuments.forEach(uri => usedFiles.add(uri));
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
