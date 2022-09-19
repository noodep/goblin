/**
 * @file renderable tests
 *
 * @author noodep
 * @version 0.03
 */

import { assertInstanceOf, fail } from "https://deno.land/std@0.158.0/testing/asserts.ts";
import Renderable from "../../../src/gl/renderable.js";

Deno.test('renderable::new', () => {
	const r = new Renderable();
	assertInstanceOf(r, Renderable);
});

Deno.test('renderable::fromJSON', () => {
	const r = Renderable.fromJSON({});
	assertInstanceOf(r, Renderable);
});
