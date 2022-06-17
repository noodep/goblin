/**
 * @author mvignati
 * @version 0.22
 */

import js from '@eslint/js';

export default [
	js.configs.recommended,
	{
		languageOptions: {
			globals: {
				"console": "readonly",
				"crypto": "readonly",
				"document": "readonly",
				"EventTarget": "readonly",
				"CustomEvent": "readonly",
				"fetch": "readonly",
				"WebGLRenderingContext": "readonly",
				"window": "readonly"
			}
		},
		rules: {
			"indent": ["error", "tab"],
			"eol-last": ["error", "always"],
			"linebreak-style": ["error", "unix"],
			"no-console": "error",
			"no-multiple-empty-lines": ["error", {"max": 1, "maxEOF": 0, "maxBOF": 0}],
			"no-trailing-spaces": "error",
			"padded-blocks": ["error", {"classes": "always"}],
			"quotes": ["error", "single"],
			"semi": ["error", "always"],
			"strict": ["error", "global"]
		}
	}
];
