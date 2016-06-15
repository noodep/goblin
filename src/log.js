'use strict';

export const LEVELS = {
	DEBUG : 0,
	INFO : 1,
	ERROR : 2,
	NONE : 3
}

export class Logger {
	constructor() {
		this._level = LEVELS.INFO;
		this._logs = new Array();
		this._subscribers = new Set();
	}

	log(log_msg, level) {
		if(level === undefined) level = Logger.levels.INFO;

		const log = {
			msg : log_msg,
			level : level
		};

		this._logs.push(log);
		if(level >= this._level) {
			this._subscribers.forEach((subscriber) => {
				subscriber.notify(log);
			});
		}
	}
		
	addSubscriber(subscriber) {
		this._subscribers.add(subscriber);
	}

	set level(level) {
		this._level = level;
	}
}

export class Console {
	notify(log) {
		console.log(log.msg);
	}
}

export const DEFAULT_LOGGER = new Logger();
DEFAULT_LOGGER.addSubscriber(new Console());

export const dl = (msg) => DEFAULT_LOGGER.log(msg, LEVELS.DEBUG);
export const l = (msg) => DEFAULT_LOGGER.log(msg, LEVELS.INFO);
export const el = (msg) => DEFAULT_LOGGER.log(msg, LEVELS.ERROR);

