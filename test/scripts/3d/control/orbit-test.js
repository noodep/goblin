/**
 * @file orbit control tests
 *
 * @author noodep
 * @version 0.82
 */

import { epsilonEquals } from '../../test-utils.js';

import Vec3 from '/src/math/vec3.js';
import OrbitControl from '/src/3d/control/orbit.js';

export default class OrbitControlTest {

	static runAll() {
		console.log('%c----- Testing /src/3d/control/orbit.js -----','color:lightblue;');
		console.time('Perf');

		OrbitControlTest.testDefaultConstruction();
		OrbitControlTest.offsetSettingCopiesValuesAndDoesNotKeepAReferenceToSuppliedVec3();
		OrbitControlTest.setOnSphereSetsAzimuthAndInclinationAndOnlyUpdatesPositionOnce();

		console.timeEnd('Perf');
		console.log('%c----------------------------------------','color:lightblue;');
		console.log('\n');
	}

	static testDefaultConstruction() {
		const target = {
			setPose: () => {}
		};
		const orbit_control = new OrbitControl(target, {element: new EventTarget()});
		console.assert(orbit_control != undefined, 'Default construction does not work.');
	}

	static offsetSettingCopiesValuesAndDoesNotKeepAReferenceToSuppliedVec3() {
		const target = {
			setPose: () => {}
		};
		const orbit_control = new OrbitControl(target, {element: new EventTarget()});
		const offset = new Vec3(1.0, 2.0, 3.0);
		orbit_control.offset = offset;
		console.assert(orbit_control.offset != offset, 'Setting offset should not keep a reference to the supplied vec3 but copy values instead');
	}

	static setOnSphereSetsAzimuthAndInclinationAndOnlyUpdatesPositionOnce() {
		const target = {
			update_count: 0,
			setPose: function() { this.update_count++; }
		};
		const angle = Math.PI/4.0;
		const orbit_control = new OrbitControl(target, {element: new EventTarget()});

		// reset the update count after orbit control initialization
		target.update_count = 0;

		orbit_control.setOnSphere(angle, angle);

		console.assert(
			epsilonEquals(orbit_control.azimuth, angle),
			`azimuth should equal ${angle}, but equals ${orbit_control.azimuth} instead`
		);

		console.assert(
			epsilonEquals(orbit_control.inclination, angle),
			`inclination should equal ${angle}, but equals ${orbit_control.inclination} instead`
		);

		console.assert(
			target.update_count == 1,
			`setOnSphere should update pose only once, but updated pose ${target.update_count} times`
		);
	}

}
