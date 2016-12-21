#version 300 es
precision mediump float;

in vec3 position;
in vec3 normal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 color;

vec3 light_position = vec3(0.0, 0.0, 0.0);
vec3 ambiant_color = vec3(0.5, 0.5, 0.8);


// Needs to be specified as in
vec3 default_color = vec3(1.0, 1.0, 1.0);

void main(void) {
	vec3 normalized_normal = normalize(normal);
	vec4 local_position = model * vec4(position, 1.0);
	vec3 light_dir = normalize(light_position - local_position.xyz);

	float factor = max(dot(light_dir, normalized_normal), 0.0);

	color = (ambiant_color + default_color) * factor;
	gl_Position = projection * view * local_position;
}
