'use strict';

import {Logger, DEFAULT_LOGGER, l, dl, el} from '../../src/log';

export default class LogTest {

	static runAll() {
		console.log(`%c----- Testing src/log.js -----`,'color:blue;');
		console.time('Perf');

		DEFAULT_LOGGER.level = Logger.LEVELS.NONE;

		dl('You should not see that.');
		l('You should not see that.');
		el('You should not see that.');

		DEFAULT_LOGGER.level = Logger.LEVELS.ERROR;

		dl('You should not see that.');
		l('You should not see that.');
		el('You should see that.');


		DEFAULT_LOGGER.level = Logger.LEVELS.INFO;

		dl('You should not see that.');
		l('You should see that.');
		el('You should see that.');

		DEFAULT_LOGGER.level = Logger.LEVELS.DEBUG;

		dl('You should see that.');
		l('You should see that.');
		el('You should see that.');

		console.timeEnd('Perf');
		console.log(`%c------------------------------`,'color:blue;');
		console.log('\n');
	}
}

