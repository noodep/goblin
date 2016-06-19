attribute vec3 a_vertex_position;
attribute vec3 a_color;

uniform mat4 u_model_view_mat;
uniform mat4 u_projection_mat;

varying vec4 v_color;

void main(void) {
	gl_Position = u_projection_mat * u_model_view_mat * vec4(a_vertex_position, 1.0);
	v_color = vec4(a_color, 1.0);
}
