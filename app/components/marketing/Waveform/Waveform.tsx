import React from "react";

import styles from "./Waveform.module.css";

export default function Waveform() {
  const topCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const reflectionCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduceMotionRef = React.useRef(false);

  React.useEffect(() => {
    const topCanvas = topCanvasRef.current;
    const reflectionCanvas = reflectionCanvasRef.current;

    if (!topCanvas || !reflectionCanvas) return;

    const topCtx = topCanvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    const reflectionCtx = reflectionCanvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!topCtx || !reflectionCtx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = motionQuery.matches;

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reduceMotionRef.current = event.matches;
    };

    motionQuery.addEventListener?.("change", handleMotionChange);

    let rafId = 0;
    let width = 0;
    let height = 0;
    let lastFrameTime = 0;
    let isInView = true;
    let isDocumentVisible = document.visibilityState !== "hidden";
    const targetFrameMs = 1000 / 24;

    const configureCanvas = (
      canvas: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D,
    ) => {
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));

      canvas.width = Math.round(nextWidth * dpr);
      canvas.height = Math.round(nextHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      width = nextWidth;
      height = nextHeight;
    };

    const resize = () => {
      configureCanvas(topCanvas, topCtx);
      configureCanvas(reflectionCanvas, reflectionCtx);
    };

    const drawWave = (
      ctx: CanvasRenderingContext2D,
      time: number,
      alpha = 1,
    ) => {
      ctx.clearRect(0, 0, width, height);

      const midY = height - 0.5;
      const baseAmplitude = Math.max(10, height * 0.58);
      const pulse = 0.7 + 0.3 * Math.sin(time * 0.9) ** 2;
      const spacing = 4;
      const intensityScale = 0.9 * alpha;

      ctx.lineCap = "round";
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(238, 244, 255, ${0.6 * intensityScale})`;
      ctx.beginPath();

      for (let x = 0; x <= width; x += spacing) {
        const xn = x / Math.max(width, 1);
        const edgeFade = Math.sin(xn * Math.PI) ** 1.35;
        const phrase =
          0.5 +
          0.28 * Math.sin(x * 0.014 + time * 0.9) +
          0.2 * Math.sin(x * 0.039 - time * 1.35) +
          0.12 * Math.sin(x * 0.086 + time * 2.1);
        const grain = 0.9 + 0.1 * Math.sin(x * 0.22 + time * 4.5);
        const amp = Math.max(
          1,
          (0.06 + Math.abs(phrase) * 0.94) *
            baseAmplitude *
            edgeFade *
            pulse *
            grain,
        );
        const y1 = midY - amp;
        const y2 = midY + amp;
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
      }

      ctx.stroke();
    };

    const drawReflection = () => {
      reflectionCtx.clearRect(0, 0, width, height);
      reflectionCtx.save();
      reflectionCtx.translate(0, height);
      reflectionCtx.scale(1, -1);
      reflectionCtx.drawImage(topCanvas, 0, 0, width, height);
      reflectionCtx.restore();
      reflectionCtx.globalAlpha = 1;
    };

    const drawFrame = (time: number) => {
      drawWave(topCtx, time, 1);
      drawReflection();
    };

    const shouldAnimate = () =>
      !reduceMotionRef.current && isInView && isDocumentVisible;

    const stopLoop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      lastFrameTime = 0;
    };

    const drawCurrentFrame = () => {
      const time = reduceMotionRef.current ? 0 : performance.now() / 1000;
      drawFrame(time);
    };

    const startLoop = () => {
      if (rafId || !shouldAnimate()) return;
      rafId = window.requestAnimationFrame(render);
    };

    const render = (timestamp: number) => {
      if (!shouldAnimate()) {
        stopLoop();
        return;
      }

      if (lastFrameTime && timestamp - lastFrameTime < targetFrameMs) {
        rafId = window.requestAnimationFrame(render);
        return;
      }

      lastFrameTime = timestamp;
      drawFrame(timestamp / 1000);
      rafId = window.requestAnimationFrame(render);
    };

    resize();
    drawFrame(0);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      drawCurrentFrame();
    });
    resizeObserver.observe(topCanvas);

    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState !== "hidden";
      if (isDocumentVisible) {
        drawCurrentFrame();
        startLoop();
      } else {
        stopLoop();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isInView = Boolean(entry?.isIntersecting);

        if (isInView) {
          drawCurrentFrame();
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(topCanvas);

    if (!reduceMotionRef.current && isDocumentVisible) {
      startLoop();
    }

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener?.("change", handleMotionChange);
    };
  }, []);

  return (
    <div className={styles.waveformCard}>
      <div className={styles.waveformCanvasWrap} aria-hidden="true">
        <canvas ref={topCanvasRef} className={styles.waveformCanvas} />
        <canvas ref={reflectionCanvasRef} className={styles.waveformCanvas} />
      </div>
      <div className={styles.waveformOverlay}>
        <div className={styles.waveformPlaceholder}>Placeholder</div>
      </div>
    </div>
  );
}
