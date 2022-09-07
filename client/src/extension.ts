import * as path from 'path';
import { ExtensionContext } from 'vscode';

import {
    LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	let serverModulePath = path.join('out', 'server.js');
	if (process.env.COLLECT_COVERAGE === 'true') {
		serverModulePath = path.join('server', 'out', 'serverWithCoverage.js');
	}
    const serverModule = context.asAbsolutePath(serverModulePath);
    const debugOptions = {execArgv: ['--nolazy', '--inspect=6009', '--enable-source-maps']};
    const serverOptions: ServerOptions = {
		run: {module: serverModule, transport: TransportKind.ipc},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};
	const clientOptions: LanguageClientOptions = {
		documentSelector: [{language: "dasm"}]
	};
    client = new LanguageClient('dasmLS', 'dasm Language Server', serverOptions, clientOptions);
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
} 
