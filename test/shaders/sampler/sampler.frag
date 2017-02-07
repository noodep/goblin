#version 300 es
precision mediump float;

uniform sampler2D sampler;

in vec2 sampler_coord;

out vec4 fragment_color;

void main(void) {
	fragment_color = texture(sampler, sampler_coord);
}

