const vs_line = `
attribute float a_miter;
attribute vec4 a_color;
attribute vec2 a_size;
attribute vec3 a_normal;
attribute vec3 a_pos;

// dash line
attribute float a_total_distance;
attribute vec2 a_distance_index;

uniform float u_heightfixed;
uniform float u_vertexScale;
uniform float u_raisingHeight;

#pragma include project_vs
#pragma include picking_vs

varying vec4 v_color;
varying mat4 styleMappingMat; // 用于将在顶点着色器中计算好的样式值传递给片元

void main() {
  // cal style mapping - 数据纹理映射部分的计算
  styleMappingMat = mat4(
    0.0, 0.0, 0.0, 0.0, // opacity - strokeOpacity - strokeWidth - empty
    0.0, 0.0, 0.0, 0.0, // strokeR - strokeG - strokeB - strokeA
    0.0, 0.0, 0.0, 0.0, // offsets[0] - offsets[1]
    0.0, 0.0, 0.0, 0.0  // distance_ratio/distance/pixelLen/texV
  );

  styleMappingMat[0][0] = 1.;

  v_color = getColorWithHighlight(a_color);

  vec3 size = a_miter * a_size.x * a_normal;

  vec2 offset = size.xy;

  float lineDistance = a_distance_index.x;
  float currentLinePointRatio = lineDistance / a_total_distance;

  float lineOffsetWidth = length(offset + offset * sign(a_miter)); // 线横向偏移的距离（向两侧偏移的和）
  float linePixelSize = a_size.x * 2.0;  // 定点位置偏移，按地图等级缩放后的距离 单侧 * 2
  float texV = lineOffsetWidth/linePixelSize; // 线图层贴图部分的 v 坐标值

  // 设置数据集的参数
  styleMappingMat[3][0] = currentLinePointRatio; // 当前点位距离占线总长的比例
  styleMappingMat[3][1] = lineDistance;       // 当前顶点的距离
//  styleMappingMat[3][2] = d_texPixelLen;    // 贴图的像素长度，根据地图层级缩放
  styleMappingMat[3][3] = texV;             // 线图层贴图部分的 v 坐标值

  vec4 project_pos = project_position(vec4(a_pos.xy, 0, 1.0));

  // gl_Position = project_common_position_to_clipspace(vec4(project_pos.xy + offset, a_size.y, 1.0));

  float h = float(a_pos.z) * u_vertexScale; // 线顶点的高度 - 兼容不存在第三个数值的情况 vertex height
  float lineHeight = a_size.y; // size 第二个参数代表的高度 [linewidth, lineheight]// mapbox

  float u_zoom = 10.0;
  float mapboxZoomScale = 4.0/pow(2.0, 21.0 - u_zoom);
  h *= mapboxZoomScale;
  h += u_raisingHeight * mapboxZoomScale;
  if(u_heightfixed > 0.0) {
      lineHeight *= mapboxZoomScale;
  }

  gl_Position = u_matrix * vec4(project_pos.xy + offset, lineHeight + h, 1.0) + u_viewport_center_projection;
  usePickColor();
}
`
const fs_line = `
precision mediump float;
uniform float u_borderWidth;

uniform vec3 u_blur;
uniform vec4 u_borderColor;
varying vec4 v_color;

#pragma include picking_fs

varying mat4 styleMappingMat;
// [animate, duration, interval, trailLength],
void main() {
  if (!setPickColor()) {
      float opacity = styleMappingMat[0][0];
      gl_FragColor = v_color;
      gl_FragColor.a *= opacity; // 全局透明度

      float v = styleMappingMat[3].a;
      float borderWidth = min(0.5, u_borderWidth);
      // 绘制 border
      if (borderWidth > 0.01) {
          float borderOuterWidth = borderWidth / 2.0;

          if (v >= 1.0 - borderWidth || v <= borderWidth) {
              if (v > borderWidth) {
                  float linear = smoothstep(0.0, 1.0, (v - (1.0 - borderWidth)) / borderWidth);
                  gl_FragColor.rgb = mix(gl_FragColor.rgb, u_borderColor.rgb, linear);
              } else if (v <= borderWidth) {
                  float linear = smoothstep(0.0, 1.0, v / borderWidth);
                  gl_FragColor.rgb = mix(u_borderColor.rgb, gl_FragColor.rgb, linear);
              }
          }

          if (v < borderOuterWidth) {
              gl_FragColor.a = mix(0.0, gl_FragColor.a, v / borderOuterWidth);
          } else if (v > 1.0 - borderOuterWidth) {
              gl_FragColor.a = mix(gl_FragColor.a, 0.0, (v - (1.0 - borderOuterWidth)) / borderOuterWidth);
          }
      }

      // blur
      // float blurV = styleMappingMat[3][3];
      // if (blurV < 0.5) {
      //     gl_FragColor.a *= mix(u_blur.r, u_blur.g, blurV / 0.5);
      // } else {
      //     gl_FragColor.a *= mix(u_blur.g, u_blur.b, (blurV - 0.5) / 0.5);
      // }
  }
}
`
export { vs_line, fs_line }
