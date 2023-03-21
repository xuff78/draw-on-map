const vs_mass = `
uniform vec2 u_icon_offset;
attribute vec2 a_pos;
uniform float u_point_size;

#pragma include project_vs
#pragma include picking_vs

void main() {
    gl_PointSize = u_point_size;

    vec4 project_pos = project_position(vec4(a_pos, 0.0, 1.0));
    gl_Position = u_matrix * project_pos + u_viewport_center_projection + vec4(u_icon_offset, 0.0, 0.0);
    usePickColor();
}`

const fs_mass = `
precision mediump float;
uniform sampler2D u_sampler;
uniform float u_opacity;

#pragma include picking_fs

void main(){
   if (!setPickColor()) {
        gl_FragColor = texture2D(u_sampler,vec2(gl_PointCoord.x, gl_PointCoord.y)) * u_opacity;
   }
}`

export { vs_mass, fs_mass }
