import {
	createConnection
} from 'vscode-languageserver/node';

const connection = createConnection();

connection.listen();
