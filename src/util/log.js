/**
 * @fileOverview General purpose Logger and associated utilities.
 *
 * @author Noodep
 * @version 0.14
 */

'use strict';

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

Logger.LEVELS = {
	DEBUG : 0,
	INFO  : 1,
	WARN  : 2,
	ERROR : 3,
	NONE  : 4
};

export class Console {
	notify(log) {
		if(log.level == Logger.LEVELS.WARN)
			console.warn(log.msg);
		else if(log.level == Logger.LEVELS.ERROR)
			console.error(log.msg);
		else
			console.log(log.msg);
	}
}

export const DEFAULT_LOGGER = new Logger();
DEFAULT_LOGGER.addSubscriber(new Console());

export const dl = (msg) => DEFAULT_LOGGER.log(msg, Logger.LEVELS.DEBUG);
export const l = (msg) => DEFAULT_LOGGER.log(msg, Logger.LEVELS.INFO);
export const wl = (msg) => DEFAULT_LOGGER.log(msg, Logger.LEVELS.WARN);
export const el = (msg) => DEFAULT_LOGGER.log(msg, Logger.LEVELS.ERROR);

