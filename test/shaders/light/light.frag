#version 300 es
precision mediump float;

in vec3 true_color;
out vec4 fragment_color;

void main(void) {
	fragment_color = vec4(true_color, 1.0);
}

