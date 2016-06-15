'use strict';

import {DEFAULT_LOGGER, LEVELS, l, dl, el} from '../src/log.js';


DEFAULT_LOGGER.level = LEVELS.NONE;

dl('You should not see that.');
l('You should not see that.');
el('You should not see that.');

DEFAULT_LOGGER.level = LEVELS.ERROR;

dl('You should not see that.');
l('You should not see that.');
el('You should see that.');


DEFAULT_LOGGER.level = LEVELS.INFO;

dl('You should not see that.');
l('You should see that.');
el('You should see that.');

DEFAULT_LOGGER.level = LEVELS.DEBUG;

dl('You should see that.');
l('You should see that.');
el('You should see that.');

