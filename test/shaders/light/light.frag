#version 300 es
precision mediump float;

in vec3 color;
out vec4 fragment_color;

void main(void) {
	fragment_color = vec4(color, 1.0);
}

