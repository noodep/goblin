#version 300 es
precision mediump float;

in vec3 position;
in vec2 uv;

uniform mat4 model;
uniform mat4 view_projection;

out vec2 sampler_coord;

void main(void) {
	gl_Position = view_projection * model * vec4(position, 1.0);
	sampler_coord = uv;
}

