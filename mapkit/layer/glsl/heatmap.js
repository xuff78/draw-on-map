const grayVs = `
        const float PI = 3.14159265;
        attribute vec4 position;
        attribute float intensity;
        varying vec2 off, dim;
        varying float vIntensity;
        uniform vec2  viewport;
        uniform float resolution;
        uniform vec4 extent;

        float mercatorXfromLng(float lng ) {
            return (180.0 + lng) / 360.0;
        }

        float mercatorYfromLat(float lat) { 
          return (180.0 - (180.0 / PI * log(tan(PI / 4.0 + lat * PI / 360.0)))) / 360.0;
        }

        float linearScale(float x, float start , float end){
          return (x - start) / (end - start);
        }

        void main(){
          vec2 zw = position.zw;   
          dim = abs(zw);    
          off = zw;    

          vec2 pos = position.xy + zw * resolution;

          pos.x = mercatorXfromLng(pos.x);
          pos.y = mercatorYfromLat(pos.y);

          float x1 = mercatorXfromLng(extent.x);
          float y1 = mercatorYfromLat(extent.y);
          float x2 = mercatorXfromLng(extent.z);
          float y2 = mercatorYfromLat(extent.w);

          float x = linearScale(pos.x , x1, x2);
          float y = linearScale(pos.y , y1, y2);

          vec2 newPos = vec2( x * 2.0 - 1.0, y * 2.0 - 1.0 );
          //vec2 newPos = vec2( pos.x * 2.0 - 1.0, -pos.y* 2.0 + 1.0 ); 
            
          vIntensity = intensity;   

          vec4 newPosition = vec4( newPos , 0.0,  1.0);  

          gl_Position = newPosition;
        }`;

const grayFs = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp int;    
        precision highp float;
        #else    
        precision mediump int;    
        precision mediump float;
        #endif
        varying vec2 off, dim;
        varying float vIntensity;
        void main(){    
          float falloff = (1.0 - smoothstep(0.0, 1.0, length(off/dim)));    
          float intensity = falloff * vIntensity;    
          gl_FragColor = vec4(intensity, intensity, intensity, intensity);
        }`;

const drawVs = `
          const float PI = 3.14159265;
          attribute vec2 position; 
          varying float v_height;
          uniform sampler2D grayTexture;
          uniform vec4  extent; 
          uniform mat4  view_matrix;
          uniform float maxHeight;
          float mercatorXfromLng(float lng) {
            return (180.0 + lng) / 360.0;
          }
          float mercatorYfromLat(float lat) { 
              return (180.0 - (180.0 / PI * log(tan(PI / 4.0 + lat * PI / 360.0)))) / 360.0;
          }
          float linearScale(float x, float start , float end){
            return (x - start) / (end - start);
          }
          void main(){  

            float x1 = mercatorXfromLng(extent.x);
            float y1 = mercatorYfromLat(extent.y);
            float x2 = mercatorXfromLng(extent.z);
            float y2 = mercatorYfromLat(extent.w);

            float x = mercatorXfromLng( extent.x + (extent.z - extent.x) * position.x);
            float y = mercatorYfromLat( extent.w + (extent.y - extent.w) * position.y);

            vec2 uv = vec2(
              linearScale(x, x1, x2),
              linearScale(y, y1, y2)
            );

            vec4  grayColor = texture2D(grayTexture,uv);
            float height = grayColor.r;

            float newHeight = height > 1.0 ? 1.0 - height : height;
            vec4 newPosition = view_matrix * vec4(x,y,newHeight * maxHeight / 20037508.3427892,1.0);
            v_height = newHeight;
            gl_Position = newPosition;
        }`;

const drawFs = (getColorFun, output) => `
          #ifdef GL_FRAGMENT_PRECISION_HIGH    
          precision highp int;    
          precision highp float;
          #else    
          precision mediump int;    
          precision mediump float;
          #endif
          uniform sampler2D source;
          uniform float opacity;
          float linstep(float low, float high, float value){    
            return clamp((value-low)/(high-low), 0.0, 1.0);
          }
          float fade(float low, float high, float value){    
            float mid = (low+high)*0.5;    
            float range = (high-low)*0.5;    
            float x = 1.0 - clamp(abs(mid-value)/range, 0.0, 1.0);    
            return smoothstep(0.0, 1.0, x);}` +
            getColorFun + "\n" + output +
            `\n\n
           varying float v_height; 
           void main(){    
            float intensity = smoothstep(0.0, 1.0, v_height);    
            vec4 color = alphaFun(getColor(intensity),intensity);
            color.a *= opacity;
            gl_FragColor = color;
            //gl_FragColor =  vec4(1.0,0.0,0.0,1.0);
          }`;

export {drawVs, drawFs, grayVs, grayFs}
