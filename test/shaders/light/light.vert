#version 300 es
precision mediump float;

in vec3 position;
in vec3 color;
in vec3 normal;

uniform mat4 model;
uniform mat4 view_projection;

out vec3 true_color;

vec3 light_position = vec3(0.0, 0.0, 0.0);
vec3 ambiant_color = vec3(0.5, 0.5, 0.8);

void main(void) {
	vec3 normalized_normal = normalize(normal);
	vec4 local_position = model * vec4(position, 1.0);
	vec3 light_dir = normalize(light_position - local_position.xyz);

	float factor = max(dot(light_dir, normalized_normal), 0.0);

	true_color = (ambiant_color + color) * factor;
	gl_Position = view_projection * local_position;
}
