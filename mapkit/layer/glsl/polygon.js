const vs_polygon = `
attribute vec2 a_pos;
attribute vec4 a_color;
varying vec4 v_color;

#pragma include project_vs
#pragma include picking_vs

void main() {
    v_color = getColorWithHighlight(a_color);

    vec4 project_pos = project_position(vec4(a_pos, 0.0, 1.0));
    gl_Position = u_matrix * project_pos + u_viewport_center_projection;
    usePickColor();
}`
const fs_polygon = `
precision mediump float;
varying vec4 v_color;

#pragma include picking_fs

void main(){
   if (!setPickColor()) {
     gl_FragColor = v_color;
   }
}`

export { vs_polygon, fs_polygon }
