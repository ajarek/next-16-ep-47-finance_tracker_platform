"use client";

import { useEffect, useRef } from "react";

/**
 * Interaktywny shader WebGL dedykowany stronie cennika.
 * Generuje:
 * 1. Płynne, pływające gradientowe okręgi reprezentujące plany cenowe.
 * 2. Elegancką siatkę (grid) z perspektywą i delikatnym pulsowaniem.
 * 3. Interaktywny reflektor (spotlight) śledzący pozycję kursora.
 */
export default function WebGlPricing() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });

    if (!gl) return;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_is_dark;

      // Funkcja pomocnicza: odległość między dwoma punktami
      float sdCircle(vec2 p, float r) {
        return length(p) - r;
      }

      // Płynny szum (smooth noise)
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 uv = vec2(st.x * aspect, st.y);
        vec2 mouse = vec2(u_mouse.x * aspect, 1.0 - u_mouse.y);

        // === 1. Tło z wielowarstwowym gradientem ===
        vec3 darkBase = vec3(0.039, 0.051, 0.102);
        vec3 darkAccent = vec3(0.0, 0.18, 0.16);
        vec3 darkGlow = vec3(0.12, 0.02, 0.08);

        vec3 lightBase = vec3(0.96, 0.97, 0.99);
        vec3 lightAccent = vec3(0.88, 0.98, 0.95);
        vec3 lightGlow = vec3(0.98, 0.93, 0.96);

        vec3 base = mix(lightBase, darkBase, u_is_dark);
        vec3 accent = mix(lightAccent, darkAccent, u_is_dark);
        vec3 glow = mix(lightGlow, darkGlow, u_is_dark);

        float wave1 = sin(st.x * 2.5 + u_time * 0.2) * 0.5 + 0.5;
        float wave2 = cos(st.y * 2.0 - u_time * 0.15) * 0.5 + 0.5;
        vec3 grad = mix(base, accent, wave1 * 0.3);
        grad = mix(grad, glow, wave2 * (1.0 - st.x) * 0.2);

        // === 2. Pływające okręgi reprezentujące plany cenowe ===
        float t = u_time * 0.3;

        // Trzy okręgi — Starter, Pro, Enterprise
        vec2 c1 = vec2(0.25 * aspect + sin(t * 0.7) * 0.08, 0.65 + cos(t * 0.5) * 0.06);
        vec2 c2 = vec2(0.5 * aspect + cos(t * 0.6) * 0.06, 0.45 + sin(t * 0.8) * 0.08);
        vec2 c3 = vec2(0.75 * aspect + sin(t * 0.5) * 0.1, 0.6 + cos(t * 0.7) * 0.05);

        float d1 = sdCircle(uv - c1, 0.15 + sin(t) * 0.02);
        float d2 = sdCircle(uv - c2, 0.2 + cos(t * 0.8) * 0.03);
        float d3 = sdCircle(uv - c3, 0.12 + sin(t * 1.2) * 0.02);

        float ring1 = smoothstep(0.005, 0.0, abs(d1) - 0.003);
        float ring2 = smoothstep(0.005, 0.0, abs(d2) - 0.004);
        float ring3 = smoothstep(0.005, 0.0, abs(d3) - 0.003);

        vec3 ringColor1 = mix(vec3(0.0, 0.6, 0.5), vec3(0.27, 0.94, 0.77), u_is_dark);
        vec3 ringColor2 = mix(vec3(0.0, 0.75, 0.65), vec3(0.35, 1.0, 0.85), u_is_dark);
        vec3 ringColor3 = mix(vec3(0.6, 0.3, 0.8), vec3(0.7, 0.4, 0.95), u_is_dark);

        float ringPulse = 0.3 + 0.15 * sin(u_time * 0.5);
        grad += ringColor1 * ring1 * ringPulse;
        grad += ringColor2 * ring2 * ringPulse * 1.2;
        grad += ringColor3 * ring3 * ringPulse * 0.8;

        // Wypełnienie wewnętrzne okręgów (delikatne)
        float fill1 = smoothstep(0.005, -0.08, d1) * 0.06;
        float fill2 = smoothstep(0.005, -0.1, d2) * 0.08;
        float fill3 = smoothstep(0.005, -0.06, d3) * 0.05;
        grad += ringColor1 * fill1;
        grad += ringColor2 * fill2;
        grad += ringColor3 * fill3;

        // === 3. Proceduralna siatka (Grid) ===
        vec2 gridUv = st * vec2(50.0 * aspect, 50.0);
        vec2 gridFract = abs(fract(gridUv - 0.5) - 0.5) / fwidth(gridUv);
        float line = min(gridFract.x, gridFract.y);
        float gridAlpha = 1.0 - min(line, 1.0);

        float gridStrength = mix(0.03, 0.05, u_is_dark);
        vec3 gridColor = mix(vec3(0.12, 0.18, 0.28), vec3(0.2, 0.85, 0.7), u_is_dark);

        // === 4. Interaktywny reflektor (Spotlight) ===
        float distToMouse = distance(uv, mouse);
        float spotlightRadius = 0.5;
        float spotlight = smoothstep(spotlightRadius, 0.0, distToMouse);

        vec3 spotColor = mix(vec3(0.0, 0.65, 0.55), vec3(0.27, 0.94, 0.77), u_is_dark);

        // Nałożenie siatki wzmocnionej w rejonie reflektora
        float dynGrid = gridAlpha * (gridStrength + spotlight * 0.15);
        grad += gridColor * dynGrid;

        // Poświata reflektora
        float spotGlow = mix(0.1, 0.2, u_is_dark);
        grad += spotColor * (spotlight * spotGlow);

        // Dodatkowy delikatny efekt szumu na krawędziach
        float n = noise(st * 8.0 + u_time * 0.1) * 0.03;
        grad += vec3(n);

        gl_FragColor = vec4(grad, 1.0);
      }
    `;

    function createShader(type: number, source: string): WebGLShader | null {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPositionLocation);
    gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

    const uResolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const uMouseLocation = gl.getUniformLocation(program, "u_mouse");
    const uTimeLocation = gl.getUniformLocation(program, "u_time");
    const uIsDarkLocation = gl.getUniformLocation(program, "u_is_dark");

    let animationFrameId: number;
    let targetMouseX = 0.5;
    let targetMouseY = 0.3;
    let currentMouseX = 0.5;
    let currentMouseY = 0.3;
    const startTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left) / rect.width;
      targetMouseY = (e.clientY - rect.top) / rect.height;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      if (
        canvas.width !== displayWidth * dpr ||
        canvas.height !== displayHeight * dpr
      ) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const render = () => {
      currentMouseX += (targetMouseX - currentMouseX) * 0.06;
      currentMouseY += (targetMouseY - currentMouseY) * 0.06;

      const isDark = document.documentElement.classList.contains("dark")
        ? 1.0
        : 0.0;
      const elapsed = (performance.now() - startTime) * 0.001;

      gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(uMouseLocation, currentMouseX, currentMouseY);
      gl.uniform1f(uTimeLocation, elapsed);
      gl.uniform1f(uIsDarkLocation, isDark);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      if (program) gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full"
      aria-hidden="true"
    />
  );
}
