(function(window, document, undefined){
	
	Logger.levels = {
		DEBUG : 0,
		INFO : 1,
		ERROR : 2,
		NONE : 3
	}

	function Logger(options) {
		options = options || {};
		this._logs = new Array();
		this._subscribers = new Array();
	}

	Logger.prototype.log = function(log_msg, level) {
		if(level === undefined) level = Logger.levels.INFO;

		var log = {
			msg : log_msg,
			level : level
		};

		this._logs.push(log);
		for (var i = this._subscribers.length - 1; i >= 0; i--) {
			this._subscribers[i].notify(log);
		};
	},
		
	Logger.prototype.addSubscriber = function(subscriber) {
			this._subscribers.push(subscriber);
	}

	window.Goblin.addModule('Logger', Logger);

	function ConsoleLogger() {
	}

	ConsoleLogger.prototype.setLevel = function(level) {
		this.level = level;
	}

	ConsoleLogger.prototype.notify = function(log) {
		if(log.level >= this.level)
			console.log(log.msg);
	}

	window.Goblin.addModule('ConsoleLogger', ConsoleLogger);

	var default_logger = new Logger();
	var console_logger = new ConsoleLogger();
	default_logger.addSubscriber(console_logger);

	window.Goblin.defaultLogger = default_logger;
	window.Goblin.prototype.dl = function(msg) { default_logger.log(msg, Logger.levels.DEBUG) };
	window.Goblin.prototype.l = function(msg) { default_logger.log(msg, Logger.levels.INFO) };
	window.Goblin.prototype.el = function(msg) { default_logger.log(msg, Logger.levels.ERROR) };
	window.Goblin.prototype.logLevel = console_logger.setLevel.bind(console_logger);

})(this, this.document);
