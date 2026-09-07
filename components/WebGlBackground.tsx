"use client";

import { useEffect, useRef } from "react";

/**
 * Komponent WebGlBackground renderuje subtelny, interaktywny shader tła WebGL.
 * Zapewnia:
 * 1. Płynne gradienty dynamiczne zależne od czasu i koloru motywu.
 * 2. Precyzyjną siatkę proceduralną (grid) z perspektywą.
 * 3. Efekt „spotlight” płynnie śledzący pozycję kursora myszy.
 */
export default function WebGlBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });

    if (!gl) {
      // Fallback w przypadku braku wsparcia WebGL
      return;
    }

    // Kod shadera wierzchołków (Vertex Shader)
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Kod shadera fragmentów (Fragment Shader)
    const fsSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_is_dark;

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 uvCorrected = vec2(st.x * aspect, st.y);
        vec2 mouseCorrected = vec2(u_mouse.x * aspect, 1.0 - u_mouse.y);

        // 1. Wielowarstwowy subtelny gradient tła
        vec3 darkBase = vec3(0.063, 0.075, 0.129); // #101321
        vec3 darkAccent = vec3(0.0, 0.25, 0.22);    // szmaragdowa poświata
        vec3 darkGlow2 = vec3(0.2, 0.04, 0.1);     // koralowy akcent w narożniku

        vec3 lightBase = vec3(0.96, 0.97, 0.99);   // #f4f6fb
        vec3 lightAccent = vec3(0.85, 0.98, 0.94);  // delikatna mięta
        vec3 lightGlow2 = vec3(0.98, 0.92, 0.94);  // delikatny róż

        vec3 baseColor = mix(lightBase, darkBase, u_is_dark);
        vec3 accentColor = mix(lightAccent, darkAccent, u_is_dark);
        vec3 accent2Color = mix(lightGlow2, darkGlow2, u_is_dark);

        // Falowanie gradientu
        float wave1 = sin(st.x * 3.0 + u_time * 0.3) * 0.5 + 0.5;
        float wave2 = cos(st.y * 2.5 - u_time * 0.2) * 0.5 + 0.5;
        vec3 ambientGrad = mix(baseColor, accentColor, wave1 * 0.35);
        ambientGrad = mix(ambientGrad, accent2Color, wave2 * (1.0 - st.x) * 0.25);

        // 2. Proceduralna, elegancka siatka (Grid)
        vec2 gridUv = st * vec2(40.0 * aspect, 40.0);
        vec2 gridFract = abs(fract(gridUv - 0.5) - 0.5) / fwidth(gridUv);
        float line = min(gridFract.x, gridFract.y);
        float gridAlpha = 1.0 - min(line, 1.0);

        float gridStrength = mix(0.04, 0.07, u_is_dark);
        vec3 gridColor = mix(vec3(0.15, 0.2, 0.3), vec3(0.27, 0.94, 0.77), u_is_dark);

        // 3. Interaktywny reflektor (Spotlight) podążający za kursorem
        float distToMouse = distance(uvCorrected, mouseCorrected);
        float spotlightRadius = 0.45;
        float spotlight = smoothstep(spotlightRadius, 0.0, distToMouse);

        vec3 spotLightColor = mix(vec3(0.0, 0.75, 0.6), vec3(0.27, 0.94, 0.77), u_is_dark);
        vec3 finalColor = ambientGrad;

        // Nałożenie siatki wzmocnionej w rejonie reflektora
        float dynamicGrid = gridAlpha * (gridStrength + spotlight * 0.12);
        finalColor += gridColor * dynamicGrid;

        // Nałożenie poświaty reflektora
        float spotGlow = mix(0.12, 0.22, u_is_dark);
        finalColor += spotLightColor * (spotlight * spotGlow);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Funkcje kompilacji shaderów
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

    // Bufor prostokąta pełnoekranowego (Quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPositionLocation);
    gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uResolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const uMouseLocation = gl.getUniformLocation(program, "u_mouse");
    const uTimeLocation = gl.getUniformLocation(program, "u_time");
    const uIsDarkLocation = gl.getUniformLocation(program, "u_is_dark");

    // Zmienne stanu animacji i pozycji kursora z interpolacją (lerp)
    let animationFrameId: number;
    let targetMouseX = 0.5;
    let targetMouseY = 0.3;
    let currentMouseX = 0.5;
    let currentMouseY = 0.3;
    const startTime = performance.now();

    // Śledzenie ruchu kursora
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left) / rect.width;
      targetMouseY = (e.clientY - rect.top) / rect.height;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Obsługa skalowania rozdzielczości okna
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Główna pętla renderowania
    const render = () => {
      // Płynna interpolacja pozycji spotlight
      currentMouseX += (targetMouseX - currentMouseX) * 0.06;
      currentMouseY += (targetMouseY - currentMouseY) * 0.06;

      const isDark = document.documentElement.classList.contains("dark") ? 1.0 : 0.0;
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
