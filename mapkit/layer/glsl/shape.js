const vs_arrow = `
attribute vec2 a_pos;
attribute float u_point_size;
attribute float a_angle;
varying float v_angle;
// uniform mat4 u_matrix;
#project insert

void main() {
    gl_PointSize = u_point_size + 4.0;

    vec4 project_pos = project_position(vec4(a_pos, 0.0, 1.0));
    gl_Position = u_matrix * project_pos + u_viewport_center_projection;
    v_angle = a_angle * PI / 180.0;
}`
const fs_arrow = `
precision mediump float;
uniform sampler2D u_sampler;
uniform float u_opacity;
varying float v_angle;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),sin(_angle),cos(_angle));
}

void main(){
   vec2 st = gl_PointCoord.xy;
   st = st - vec2(0.5);
   st = rotate2d(v_angle) * st;
   st = st + vec2(0.5);
   gl_FragColor = texture2D(u_sampler, st) * u_opacity;
}`
const vs_sdf = `
attribute vec2 a_pos;
attribute vec2 a_extrude;
attribute vec4 a_color;
attribute float a_type_radius;
attribute float a_angle_stroke;

// uniform mat4 u_matrix;
// uniform vec2 u_extrude_scale;

varying vec4 v_color;
varying vec4 v_stroke_color;
varying vec4 v_data;
varying vec2 v_data2;

#pragma include project_vs
#pragma include picking_vs

const float SHIFT_LEFT17 = 131072.0;
const float SHIFT_RIGHT17 = 1.0 / 131072.0;

vec2 unpack_float(const float packedValue) {
  int packedIntValue = int(packedValue);
  int v0 = packedIntValue / 256;
  return vec2(v0, packedIntValue - v0 * 256);
}

vec4 decode_color(const vec2 encodedColor) {
  return vec4(
    unpack_float(encodedColor[0]),
    unpack_float(encodedColor[1])
  );
}

void main() {
    float DEVICE_PIXEL_RATIO = 1.0;

    v_color = getColorWithHighlight(decode_color(a_color.xy));
    v_stroke_color = decode_color(a_color.zw) / 255.0;

    float compressed = a_type_radius;
    float type = floor(compressed * SHIFT_RIGHT17);
    float radius = compressed - type * SHIFT_LEFT17;

    compressed = a_angle_stroke;
    float angle = floor(compressed * SHIFT_RIGHT17);
    float stroke_width = compressed - angle * SHIFT_LEFT17;

    if (type < 2.0) angle = angle - 180.0;
    else if (type == 3.0) angle = angle - 35.0;
    angle = angle * PI / 180.0;
    highp float angle_sin = sin(angle);
    highp float angle_cos = cos(angle);
    mat2 rotation_matrix = mat2(angle_cos, angle_sin, -angle_sin, angle_cos);

    vec2 offset = rotation_matrix * a_extrude * (radius + stroke_width);
    vec4 project_pos = project_position(vec4(a_pos, 0.0, 1.0));
    gl_Position = u_matrix * vec4(project_pos.xy + offset, 0.0, 1.0) + u_viewport_center_projection;
    // gl_Position.xy += rotation_matrix * a_extrude * (radius + stroke_width) * u_extrude_scale * gl_Position.w;

    float antialiasblur = 1.0 / DEVICE_PIXEL_RATIO / (radius + stroke_width);

    v_data = vec4(a_extrude, antialiasblur, type);
    v_data2 = vec2(radius, stroke_width);
    usePickColor();
}
`
const fs_sdf = `
precision mediump float;
varying vec4 v_color;
varying vec4 v_stroke_color;
varying vec4 v_data;
varying vec2 v_data2;

// sdf图形渲染算法
float ndot(vec2 a, vec2 b) { return a.x*b.x - a.y*b.y; }

float sdUnevenCapsule( vec2 p, float r1, float r2, float h ) {
    p.x = abs(p.x);
    float b = (r1-r2)/h;
    float a = sqrt(1.0-b*b);
    float k = dot(p,vec2(-b,a));
    if( k < 0.0 ) return length(p) - r1;
    if( k > a*h ) return length(p-vec2(0.0,h)) - r2;
    return dot(p, vec2(a,b) ) - r1;
}

float myIsoscelesTrapezoidSDF(in vec2 p, in float r1, in float r2, in float h) {
    //计算距离值
    p.x = abs(p.x);
    vec2 qp1 = vec2(max(p.x-((p.y>0.0)?r1:r2), 0.0), abs(p.y)-h);

    vec2 ap = p-vec2(r1,h);
    vec2 ab = vec2(r2,-h) - vec2(r1,h);
    vec2 qp2 = ap-ab*clamp(dot(ap,ab)/dot(ab,ab), 0.0, 1.0);
    //判断距离正负
    float s = (qp1.y<0.0 && qp2.x<0.0)?-1.0:1.0;
    return s*min(length(qp1), length(qp2));
}


float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p)-b;
  return length(max(d,vec2(0))) + min(max(d.x,d.y),0.0);
}

float sdPentagon(vec2 p, float r) {
  const vec3 k = vec3(0.809016994,0.587785252,0.726542528);
  p.x = abs(p.x);
  p -= 2.0*min(dot(vec2(-k.x,k.y),p),0.0)*vec2(-k.x,k.y);
  p -= 2.0*min(dot(vec2( k.x,k.y),p),0.0)*vec2( k.x,k.y);
  p -= vec2(clamp(p.x,-r*k.z,r*k.z),r);
  return length(p)*sign(p.y);
}

float sdHexagon(vec2 p, float r) {
  const vec3 k = vec3(-0.866025404,0.5,0.577350269);
  p = abs(p);
  p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
  p -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
  return length(p)*sign(p.y);
}

float sdStar5(in vec2 p, in float r, in float rf) {
    const vec2 k1 = vec2(0.809016994375, -0.587785252292);
    const vec2 k2 = vec2(-k1.x,k1.y);
    p.x = abs(p.x);
    p -= 2.0*max(dot(k1,p),0.0)*k1;
    p -= 2.0*max(dot(k2,p),0.0)*k2;
    p.x = abs(p.x);
    p.y -= r;
    vec2 ba = rf*vec2(-k1.y,k1.x) - vec2(0,1);
    float h = clamp( dot(p,ba)/dot(ba,ba), 0.0, r );
    return length(p-ba*h) * sign(p.y*ba.x-p.x*ba.y);
}

float sdHexagram(vec2 p, float r) {
  const vec4 k=vec4(-0.5,0.8660254038,0.5773502692,1.7320508076);
  p = abs(p);
  p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
  p -= 2.0*min(dot(k.yx,p),0.0)*k.yx;
  p -= vec2(clamp(p.x,r*k.z,r*k.w),r);
  return length(p)*sign(p.y);
}

float sdRhombus(vec2 p, vec2 b) {
  vec2 q = abs(p);
  float h = clamp((-2.0*ndot(q,b)+ndot(b,b))/dot(b,b),-1.0,1.0);
  float d = length( q - 0.5*b*vec2(1.0-h,1.0+h) );
  return d * sign( q.x*b.y + q.y*b.x - b.x*b.y );
}

float sdCross( in vec2 p, in vec2 b, float r ) {
    p = abs(p); p = (p.y>p.x) ? p.yx : p.xy;
    vec2  q = p - b;
    float k = max(q.y,q.x);
    vec2  w = (k>0.0) ? q : vec2(b.y-p.x,-k);
    return sign(k)*length(max(w,0.0)) + r;
}

#pragma include picking_fs

void main() {
    if (!setPickColor()) {
      vec2 extrude = v_data.xy;
      lowp float antialiasblur = v_data.z;
      int shape = int(v_data.w);

      float radius = v_data2.x;
      float stroke_width = v_data2.y;

      float r = radius / (radius + stroke_width);

      float outer_df;
      float inner_df;
      
    if (shape == 0) {
        outer_df = myIsoscelesTrapezoidSDF(extrude, 0.0, 0.8, 0.9);
        inner_df = myIsoscelesTrapezoidSDF(1.0 / r * extrude, 0.0, 0.8, 1.07);
    } else if (shape == 1) {
        outer_df = sdUnevenCapsule(1.2 * r * extrude, 0.5, 0.1, 1.0);
        inner_df = sdUnevenCapsule(1.0 / r * extrude, 0.5, 0.1, 1.0);
    } else if (shape == 2) {
        outer_df = sdPentagon(extrude, 0.8);
        inner_df = sdPentagon(extrude, r * 0.8);
    } else if (shape == 3) {
        outer_df = sdStar5(extrude, 1.0, 0.7);
        inner_df = sdStar5(extrude, r, r * 0.7);
    } else if (shape == 4) {
        outer_df = sdHexagon(extrude, 0.8);
        inner_df = sdHexagon(extrude, r * 0.8);
    } else if (shape == 5) {
        outer_df = sdHexagram(extrude, 0.52);
        inner_df = sdHexagram(extrude, r * 0.52);
    } else if (shape == 6) {
        outer_df = sdBox(extrude, vec2(1.));
        inner_df = sdBox(extrude, vec2(r));
    } else if (shape == 7) {
        outer_df = sdCross(1.0 * extrude, vec2(4.0, 0.5), 0.05);
        inner_df = sdCross(1.2 / r * extrude, vec2(4.0, 0.5), 0.05);
    }

      float blur = 0.;
      float antialiased_blur = -max(blur, antialiasblur);

      float opacity_t = smoothstep(0.0, antialiased_blur, outer_df);

      float color_t = stroke_width < 0.01 ? 0.0 : smoothstep(
          antialiased_blur,
          0.0,
          inner_df
      );

      gl_FragColor = opacity_t * mix(vec4(v_color.xyz, 1) * v_color.w, vec4(v_stroke_color.xyz, 1) * v_stroke_color.w, color_t);
    }
}
`
export { vs_arrow, fs_arrow, vs_sdf, fs_sdf }
