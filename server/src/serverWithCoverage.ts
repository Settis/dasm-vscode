import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as NYC from 'nyc';

function setupNyc() {
	//const NYC = require("nyc");
	// create an nyc instance, config here is the same as your package.json
	const nycInstance = new NYC({
		cache: false,
		cwd: path.join(__dirname, ".."),
		exclude: [
			"**/**.test.js",
		],
		extension: [
			".ts",
			".tsx",
		],
		hookRequire: true,
		hookRunInContext: true,
		hookRunInThisContext: true,
		instrument: true,
		reporter: ["text", "html", "cobertura", "lcov"],
		require: [
			"ts-node/register",
		],
		sourceMap: true,
	});
	nycInstance.wrap();
	return nycInstance;
}

const nyc = setupNyc();

import { connection } from "./server";
import { ExecuteCommandRequest } from 'vscode-languageserver';

const FLASH_CC_COMMAND = 'dasm.flashCodeCoverage';

connection.onInitialized(_ => {
	connection.client.register(ExecuteCommandRequest.type, {
		commands: [FLASH_CC_COMMAND]
	});
});

connection.onExecuteCommand(params => {
	if (params.command === FLASH_CC_COMMAND && nyc) {
		nyc.writeCoverageFile();
        nyc.report();
	}
});
