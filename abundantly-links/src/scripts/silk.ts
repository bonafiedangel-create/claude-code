// The flowing silk background: a small WebGL fragment shader (no library), rendered at half
// resolution, paused when the tab is hidden, and drawn once (no motion) under reduced motion.
// It blends from morning linen and peach to Bordeaux night as `n` goes from 0 to 1.
const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `precision mediump float;uniform vec2 r;uniform float t;uniform float n;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float no(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*no(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*1.5+(m-.5)*.18;float T=t*.035;
 vec2 q=vec2(fb(p+T),fb(p+vec2(5.2,1.3)-T));vec2 w=vec2(fb(p+3.*q+vec2(1.7,9.2)+T*1.3),fb(p+3.*q+vec2(8.3,2.8)-T));
 float f=fb(p+2.4*w);float fold=sin((p.x*1.2+p.y*.7+f*3.2)*3.)*.5+.5;
 vec3 A=mix(vec3(1.,.988,.976),vec3(.09,.03,.04),n);vec3 B=mix(vec3(.957,.85,.776),vec3(.30,.08,.11),n);
 vec3 C=mix(vec3(.80,.58,.50),vec3(.60,.22,.17),n);vec3 D=mix(vec3(.969,.933,.898),vec3(.14,.05,.06),n);
 vec3 col=mix(A,B,smoothstep(.25,.8,f));col=mix(col,D,smoothstep(.35,.95,length(q)*.75));
 col=mix(col,C,smoothstep(.6,.98,f*fold)*mix(.35,.55,n));col+=(fold-.5)*mix(.035,.05,n);col=mix(col,vec3(.88,.56,.44),sin(n*3.1416)*.38);
 gl_FragColor=vec4(col,1.);}`;

export function initSilk(canvas: HTMLCanvasElement, reduce: boolean, coarse: boolean) {
  let gl: WebGLRenderingContext | null = null;
  let uR: WebGLUniformLocation | null = null,
    uT: WebGLUniformLocation | null = null,
    uN: WebGLUniformLocation | null = null,
    uM: WebGLUniformLocation | null = null;
  const mouse = [0.5, 0.5],
    mouseS = [0.5, 0.5];
  let lastN = -1;
  try {
    gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl) throw 0;
    // No graphics chip (software rendering): the static gradient looks the same and costs nothing.
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) throw 0;
    const sh = (type: number, src: string) => {
      const o = gl!.createShader(type)!;
      gl!.shaderSource(o, src);
      gl!.compileShader(o);
      if (!gl!.getShaderParameter(o, gl!.COMPILE_STATUS)) throw gl!.getShaderInfoLog(o);
      return o;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    uR = gl.getUniformLocation(prog, 'r');
    uT = gl.getUniformLocation(prog, 't');
    uN = gl.getUniformLocation(prog, 'n');
    uM = gl.getUniformLocation(prog, 'm');
  } catch {
    gl = null; // the CSS gradient on the canvas stays as the fallback
  }
  let started = false,
    lastDraw = 0;
  const minGap = coarse ? 1000 / 30 : 0; // phones: 30 frames a second is plenty for slow silk
  const size = () => {
    if (!gl) return;
    const s = (coarse ? 0.35 : 0.5) * Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * s);
    canvas.height = Math.round(innerHeight * s);
    gl.viewport(0, 0, canvas.width, canvas.height);
    lastN = -1;
  };
  size();
  addEventListener('resize', size);

  return {
    pointer(x: number, y: number) {
      mouse[0] = x;
      mouse[1] = y;
    },
    start() {
      started = true;
    },
    draw(t: number, n: number) {
      if (!gl || !started || document.hidden) return;
      const now = performance.now();
      if (now - lastDraw < minGap) return;
      lastDraw = now;
      if (!canvas.style.background) canvas.style.background = 'none';
      if (reduce) {
        if (Math.abs(n - lastN) < 0.004) return;
        t = 8;
      }
      lastN = n;
      mouseS[0] += (mouse[0] - mouseS[0]) * 0.03;
      mouseS[1] += (mouse[1] - mouseS[1]) * 0.03;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, t);
      gl.uniform1f(uN, n);
      gl.uniform2f(uM, mouseS[0], mouseS[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
