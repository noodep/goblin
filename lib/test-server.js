/**
 * @file development webserver
 *
 * @author noodep
 * @version 0.14
 */

import { Server } from'./server.js';
import FileHandler from './file-handler.js';

// The default mime type is already text/plain, but this shows a usecase of mime-type override.
const FILE_HANDLER_OPTIONS = {
	mime_types: {
		'.vert': 'text/plain',
		'.frag': 'text/plain'
	}
};

const server = new Server(process.argv[2], process.argv[3]);
server.addRoute('*', new FileHandler(FILE_HANDLER_OPTIONS));
server.start();
