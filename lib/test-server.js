const Server = require('./server.js');

const server = new Server(process.argv[2], process.argv[3]);
server.addRoute('*', Server.FILE_HANDLER);
server.addRoute('^.*.js\\+bundle$', Server.ROLLUP_HANDLER);
server.start();

