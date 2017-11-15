const Server = require('./server.js');

const FileHandler = require('./file-handler.js')

const server = new Server(process.argv[2], process.argv[3]);
server.addRoute('*', new FileHandler());
server.start();

