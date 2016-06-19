'use strict';

import Vec3 from '../../../src/math/vec3.js';

console.log(`----- Testing src/math/vec3.js -----`);

const v0 = new Vec3();
console.log(`Constructor default : ${v0.x == 0.0 && v0.y == 0.0 && v0.z == 0.0}`);

const v1 = new Vec3(0.0, 0.0, 0.0);
console.log(`Constructor zeroes : ${v1.x == 0.0 && v1.y == 0.0 && v1.z == 0.0}`);

const v2 = new Vec3(1.2, 3.4, 5.6);
console.log(`Constructor : ${v2.x == 1.2 && v2.y == 3.4 && v2.z == 5.6}`);

const v3 = new Vec3();
v3.x = 1.3;
v3.y = 2.4;
v3.z = 3.5;
console.log(`Setters : ${v3.x == 1.3 && v3.y == 2.4 && v3.z == 3.5}`);

const v4 = new Vec3();
v4.identity();
console.log(`Identity : ${v4.x == 1.0 && v4.y == 1.0 && v4.z == 1.0}`);

const v5 = new Vec3(3.5, 7.11, 13.17);
const v5$clone = v5.clone();
console.log(`Cloning : ${v5$clone.x == 3.5 && v5$clone.y == 7.11 && v5$clone.z == 13.17}`);

const v6 = new Vec3(17.13, 11.7, 5.3);
const v6$copy = new Vec3();
v6$copy.copy(v6);

console.log(`Copy : ${v6$copy.x == 17.13 && v6$copy.y == 11.7 && v6$copy.z == 5.3}`);

const v7 = new Vec3(11.12, 13.14, 15.16);
v7.negate();
console.log(`Negate : ${v7.x == -11.12 && v7.y == -13.14 && v7.z == -15.16}`);

const v8 = new Vec3(2, 4, 8);
v8.inverse();
console.log(`Inverse : ${v8.x == 0.5 && v8.y == 0.25 && v8.z == 0.125}`);

const v9 = new Vec3(2, 4, 8);
const v9$x = Math.random();
const v9$y = Math.random();
const v9$z = Math.random();
v9.x = v9$x;
v9.y = v9$y;
v9.z = v9$z;
v9.inverse();
console.log(`Inverse (random) : ${v9.x == 1.0 / v9$x && v9.y == 1.0 / v9$y && v9.z == 1.0 / v9$z}`);

const v10 = new Vec3()
v10.inverse();
console.log(`Inverse (zero) : ${v10.x == Infinity && v10.y == Infinity && v10.z == Infinity}`);

const v11 = new Vec3();
v11.scale(Math.random());
console.log(`Scale (zero random) : ${v11.x == 0.0 && v11.y == 0.0 && v11.z == 0.0}`);

const v12 = new Vec3(Math.random(), Math.random(), Math.random());
v12.scale(0.0);
console.log(`Scale (random zero) : ${v12.x == 0.0 && v12.y == 0.0 && v12.z == 0.0}`);

const v13 = new Vec3();
v13.identity();
v13.scale(23.27);
console.log(`Scale (identity) : ${v13.x == 23.27 && v13.y == 23.27 && v13.z == 23.27}`);

const v14 = new Vec3(1.23, 4.56, 7.89);
v14.scale(1.0);
console.log(`Scale (by one) : ${v14.x == 1.23 && v14.y == 4.56 && v14.z == 7.89}`);

const v15 = new Vec3(9.7, 5.4, 2.1);
const v15$1 = new Vec3(6.4, 3.1, 9.8);
v15.multiply(v15$1);
console.log(`Multiply : ${v15.x.toFixed(2) == 62.08 && v15.y.toFixed(2) == 16.74 && v15.z.toFixed(2) == 20.58}`);

