/**
 * @file general purpose Logger and associated utilities.
 *
 * @author noodep
 * @version 0.27
 */

export class Logger {

	constructor() {
		this._level = Logger.LEVELS.INFO;
		this._logs = new Array();
		this._subscribers = new Set();
	}

	log(log_msg, level) {
		if(level === undefined) level = Logger.LEVELS.INFO;

		const log = {
			msg : log_msg,
			level : level
		};

		this._logs.push(log);
		if(level >= this._level) {
			for (let subscriber of this._subscribers) {
				subscriber.notify(log);
			}
		}
	}

	addSubscriber(subscriber) {
		this._subscribers.add(subscriber);
	}

	set level(level) {
		this._level = level;
	}

}

Logger.LEVELS = {
	ALL   : -1,
	DEBUG : 0,
	INFO  : 1,
	WARN  : 2,
	ERROR : 3,
	NONE  : 4
};

export class Console {

	constructor(console) {
		this._console = console;
	}

	notify(log) {
		if(log.level == Logger.LEVELS.WARN)
			this._console.warn(log.msg);
		else if(log.level == Logger.LEVELS.ERROR)
			this._console.error(log.msg);
		else if(log.level == Logger.LEVELS.INFO)
			this._console.info(log.msg);
		else
			this._console.log(log.msg);
	}

}

export const DEFAULT_LOGGER = new Logger();
DEFAULT_LOGGER.addSubscriber(new Console(console));

export const dl = (msg) => DEFAULT_LOGGER.log(msg, Logger.LEVELS.DEBUG);
export const il = (msg) => DEFAULT_LOGGER.log(msg, Logger.LEVELS.INFO);
export const l = (msg) => DEFAULT_LOGGER.log(msg, Logger.LEVELS.INFO);
export const wl = (msg) => DEFAULT_LOGGER.log(msg, Logger.LEVELS.WARN);
export const el = (msg) => DEFAULT_LOGGER.log(msg, Logger.LEVELS.ERROR);
