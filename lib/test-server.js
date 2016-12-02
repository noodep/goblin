const Server = require('./server.js');

const FileHandler = require('./file-handler.js')
const RollupHandler = require('./rollup-handler.js')

const ROLLUP_OPTIONS = {
	include_paths: {
		include: {},
		paths: ['.'],
		external: [],
		extensions: ['.js']
	}
};

const server = new Server(process.argv[2], process.argv[3]);
server.addRoute('*', new FileHandler());
server.addRoute('^.*.js\\+bundle$', new RollupHandler(ROLLUP_OPTIONS));
server.start();

