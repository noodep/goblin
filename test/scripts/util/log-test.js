/**
 * @file logging tests
 *
 * @author noodep
 * @version 0.03
 */

import { Logger, DEFAULT_LOGGER, dl, wl, l, el } from '/src/util/log.js';

export default class LogTest {

	static runAll() {
		console.log('%c----- Testing /src/util/log.js -----','color:blue;');
		console.time('Perf');

		DEFAULT_LOGGER.level = Logger.LEVELS.NONE;
		dl('You should not see this debug.');
		l('You should not see this info.');
		wl('You should not see this warning.');
		el('You should not see this error.');

		DEFAULT_LOGGER.level = Logger.LEVELS.ERROR;
		dl('You should not see this debug.');
		l('You should not see this info.');
		wl('You should not see this warning.');
		el('You should see this error.');

		DEFAULT_LOGGER.level = Logger.LEVELS.WARN;
		dl('You should not see this debug.');
		l('You should not see this info.');
		wl('You should see this warning.');
		el('You should see this error.');

		DEFAULT_LOGGER.level = Logger.LEVELS.INFO;
		dl('You should not see this debug.');
		l('You should see this info.');
		wl('You should see this warning.');
		el('You should see this error.');

		DEFAULT_LOGGER.level = Logger.LEVELS.DEBUG;
		dl('You should see this debug.');
		l('You should see this info.');
		wl('You should see this warning.');
		el('You should see this error.');

		console.timeEnd('Perf');
		console.log('%c------------------------------','color:blue;');
		console.log('\n');
	}

}
