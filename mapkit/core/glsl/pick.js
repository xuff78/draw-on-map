const pick_fs = `
varying vec4 v_pick_color;
uniform bool u_for_fbo;

bool setPickColor() {
  if (u_for_fbo) {
    gl_FragColor = v_pick_color;
  }
  return u_for_fbo;
}
`
const pick_vs = `
attribute vec3 a_pick_color;
varying vec4 v_pick_color;
uniform bool u_for_fbo;
uniform bool u_use_highlight;
uniform vec4 u_highlight_color;
uniform vec3 u_highlight_id;

vec4 getColorWithHighlight(vec4 color) {
  if (u_use_highlight && u_highlight_id.x == a_pick_color.x && u_highlight_id.y == a_pick_color.y && u_highlight_id.z == a_pick_color.z) {
    return u_highlight_color / 255.0;
  } else {
    return color / 255.0;
  }
}
void usePickColor() {
  if (u_for_fbo) {
    v_pick_color = vec4(a_pick_color / 255.0, 1.0);
  }
}
`

export { pick_fs, pick_vs }
