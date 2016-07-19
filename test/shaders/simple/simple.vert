attribute vec3 a_vertex_position;

uniform mat4 u_model_mat;
uniform mat4 u_view_mat;
uniform mat4 u_projection_mat;

varying vec4 v_color;

void main(void) {
	gl_Position = u_projection_mat * u_view_mat * u_model_mat * vec4(a_vertex_position, 1.0);
	v_color = vec4(a_vertex_position, 1.0);
}

