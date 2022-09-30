/**
 * @file object3d tests
 *
 * @author noodep
 * @version 1.93
 */

import { assert, assertEquals, assertInstanceOf, assertNotStrictEquals, assertStrictEquals, assertThrows} from 'https://deno.land/std@0.158.0/testing/asserts.ts';
import Object3D from '../../../src/3d/object3d.js';
import Vec3 from '../../../src/math/vec3.js';

Deno.test('object::new', async test => {

	await test.step('default', () => {
		const o = new Object3D();
		assertInstanceOf(o, Object3D);
		assertInstanceOf(o.origin, Vec3);
	});

	await test.step('origin', async origin_test => {

		await origin_test.step('array', () => {
			const o = new Object3D({
				origin: [0.0, 0.0, 0.0],
			});
			assertInstanceOf(o.origin, Vec3);
		});

		await origin_test.step('vec', () => {
			const origin = new Vec3();
			const o = new Object3D({
				origin: origin
			});
			assertNotStrictEquals(o.origin, origin);
		});

	});

	await test.step('children', async children_test => {

		await children_test.step('no children', () => {
			const o = new Object3D();
			assertEquals(o.childCount, 0);
		});

		await children_test.step('non zero child count', () => {
			const child = new Object3D();

			const o = new Object3D({
				children: [
					child
				]
			});

			assertEquals(o.childCount, 1);
			assert(o.hasChild(child.id));
		});

	});

});

Deno.test('object::fromJSON', async test => {

	await test.step('default', () => {
		const o = Object3D.fromJSON({});
		assertInstanceOf(o, Object3D);
		assertInstanceOf(o.origin, Vec3);
	});

	await test.step('origin', async origin_test => {

		await origin_test.step('array', () => {
			const o = Object3D.fromJSON({
				origin: [0.0, 0.0, 0.0],
			});
			assertInstanceOf(o.origin, Vec3);
		});

		await origin_test.step('vec', () => {
			const origin = new Vec3();
			const o = Object3D.fromJSON({
				origin: origin
			});
			assertNotStrictEquals(o.origin, origin);
		});

	});

	await test.step('children', async children_test => {

		await children_test.step('instance type', () => {
			// tests that a subclass can be properly typed without overriding `parse` or `fromJSON`
			class NoOverrideObject3D extends Object3D {}

			// demonstrates and tests the feasability of a subclass with non optional instance arguments in the constructor
			class OverrideObject3D extends Object3D {

				constructor(instance_property, options) {
					super(options);
					this.instance_property = instance_property;
				}

				static parse({ 'instance-property': property, ...properties }) {
					const [ options ] = super.parse(properties);
					const instance_property = new String(property);
					return [instance_property, options];
				}

			}

			// demonstrates the usability of a sub class which parent has a non optional argument
			class SubOverrideObject3D extends OverrideObject3D {

				constructor(instance_property, { optional_property = '', ...options }) {
					super(instance_property, options);
					this.optional_property = optional_property;
				}

				static parse({ 'optional-property': optional_property, ...properties }) {
					const [ instance_property, options ] = super.parse(properties);
					options.optional_property = optional_property;
					return [instance_property, options];
				}

			}

			Object3D.registerTypeMapping('object-3d', Object3D);
			Object3D.registerTypeMapping('no-override-object-3d', NoOverrideObject3D);
			Object3D.registerTypeMapping('sub-override-object-3d', SubOverrideObject3D);

			const a_properties = {
				'type': 'object-3d',
				'id': 'a',
			};

			const b_properties = {
				'type': 'no-override-object-3d',
				'id': 'b',
			};

			const c_properties = {
				'type': 'sub-override-object-3d',
				'id': 'c',
				'instance-property': 'instance-property-value',
				'optional-property': 'optional-property-value',
			};

			const children_properties = [a_properties, b_properties, c_properties];

			const node = Object3D.fromJSON({
				'children': children_properties,
			});

			assertEquals(node.childCount, children_properties.length);

			for (let child_properties of children_properties) {
				const child_node = node.child(child_properties['id']);
				const child_type = Object3D.type_mapping.get(child_properties['type']);
				assertInstanceOf(child_node, child_type);
				assertStrictEquals(child_node.parent, node);
			}

			const c_node = node.child(c_properties['id']);
			assertInstanceOf(c_node.instance_property, String);
			assertEquals(c_node.instance_property, new String(c_properties['instance-property']));
			assertEquals(c_node.optional_property, c_properties['optional-property']);
		});

	});

});

Deno.test('object3d::addChild', async add_child_test => {

	await add_child_test.step('adds child on creation and set parent', () => {
		const aa = new Object3D();
		const a = new Object3D({children: [aa]});
		assertStrictEquals(a, aa.parent);
	});

	await add_child_test.step('cannot add child that already has a parent', () => {
		const aa = new Object3D();
		const a = new Object3D({children: [aa]});
		const b = new Object3D();
		assertThrows(() => b.addChild(aa), Error);
	});

});


Deno.test('object\'s name defaults to its id if undefined', () => {
	const id = 'test-id';
	const o = new Object3D({id: id});
	assertEquals(o.name, id);
});
