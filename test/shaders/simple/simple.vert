#version 300 es
precision mediump float;

in vec3 position;

uniform mat4 model;
uniform mat4 view_projection;

out vec4 color;

void main(void) {
	gl_Position = view_projection * model * vec4(position, 1.0);
	color = vec4(position, 1.0);
}

