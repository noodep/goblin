(function(window, document, undefined){
	
	Logger.levels = {
		ALL : -1,
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
	}

	Logger.prototype.getLogs = function() {
		return this._logs;
	}

	Logger.prototype.addSubscriber = function(subscriber) {
		this._subscribers.push(subscriber);
	}

	Goblin.extend('Logger', Logger);

	function ConsoleLogger() {
		this.setLevel(Logger.levels.INFO);
	}

	ConsoleLogger.prototype.setLevel = function(level) {
		this.level = level;
	}

	ConsoleLogger.prototype.notify = function(log) {
		if(log.level >= this.level)
			console.log(log.msg);
	}

	Goblin.extend('ConsoleLogger', ConsoleLogger);

	var default_logger = new Logger();
	var console_logger = new ConsoleLogger();
	default_logger.addSubscriber(console_logger);

	Goblin.extend('defaultLogger', default_logger);
	window.Goblin.extend('dl', function(msg) { default_logger.log(msg, Logger.levels.DEBUG); });
	window.Goblin.extend('l', function(msg) { default_logger.log(msg, Logger.levels.INFO); });
	window.Goblin.extend('el', function(msg) { default_logger.log(msg, Logger.levels.ERROR); });
	window.Goblin.extend('logLevel', console_logger.setLevel.bind(console_logger));

})(this, this.document);
