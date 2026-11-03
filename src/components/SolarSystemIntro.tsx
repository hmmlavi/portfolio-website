import { useEffect, useRef, useState } from "react";

type Stage = "system" | "scan" | "earth" | "india" | "done";
const INTRO_DURATION = 12000;
const NASA_EARTH_TEXTURE = "https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/january/world.200401.3x5400x2700.jpg";

function smooth(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function seeded(index: number) {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function drawPlanet(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, colors: string[], type: string, earthTexture: HTMLImageElement | null, elapsed: number) {
  ctx.save();
  if (type === "earth" && earthTexture?.complete && earthTexture.naturalWidth) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    const offset = ((elapsed * 0.004) % 1) * earthTexture.naturalWidth;
    const size = radius * 2.25;
    ctx.drawImage(earthTexture, -offset, y - radius * 1.08, size, radius * 2.16);
    ctx.drawImage(earthTexture, size - offset, y - radius * 1.08, size, radius * 2.16);
    const shade = ctx.createRadialGradient(x - radius * .42, y - radius * .42, radius * .08, x, y, radius * 1.18);
    shade.addColorStop(0, "rgba(255,255,255,.16)");
    shade.addColorStop(.48, "rgba(8,28,58,.02)");
    shade.addColorStop(1, "rgba(0,4,18,.88)");
    ctx.fillStyle = shade;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
    ctx.save();
    ctx.shadowColor = "#52baff";
    ctx.shadowBlur = radius * .22;
    ctx.strokeStyle = "rgba(117,205,255,.78)";
    ctx.lineWidth = Math.max(1, radius * .018);
    ctx.beginPath(); ctx.arc(x, y, radius + 1, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    return;
  }

  const gradient = ctx.createRadialGradient(x - radius * .38, y - radius * .42, radius * .04, x, y, radius * 1.12);
  colors.forEach((color, index) => gradient.addColorStop(index / (colors.length - 1), color));
  ctx.shadowColor = colors[0];
  ctx.shadowBlur = radius * .5;
  ctx.fillStyle = gradient;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.clip();
  if (type === "jupiter" || type === "saturn") {
    for (let band = -4; band <= 4; band++) {
      ctx.fillStyle = band % 2 ? "rgba(255,239,211,.25)" : "rgba(75,48,39,.22)";
      ctx.fillRect(x - radius, y + band * radius * .19, radius * 2, radius * .095);
    }
    if (type === "jupiter") {
      ctx.fillStyle = "rgba(174,91,61,.8)";
      ctx.beginPath(); ctx.ellipse(x + radius * .35, y + radius * .2, radius * .2, radius * .105, -.15, 0, Math.PI * 2); ctx.fill();
    }
  } else if (type === "mars") {
    ctx.fillStyle = "rgba(77,35,28,.35)";
    for (let crater = 0; crater < 5; crater++) {
      ctx.beginPath(); ctx.arc(x + Math.sin(crater * 5) * radius * .5, y + Math.cos(crater * 4) * radius * .45, radius * .1, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  if (type === "saturn") {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-.28);
    ctx.strokeStyle = "rgba(226,204,164,.8)"; ctx.lineWidth = radius * .2;
    ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.72, radius * .48, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(255,239,207,.55)"; ctx.lineWidth = Math.max(1, radius * .035);
    ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.9, radius * .55, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

export default function SolarSystemIntro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(() => {
    try { return !sessionStorage.getItem("lavi-solar-intro-seen") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch { return false; }
  });
  const [stage, setStage] = useState<Stage>("system");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) { setVisible(false); return; }

    const earthTexture = new Image();
    earthTexture.decoding = "async";
    earthTexture.src = NASA_EARTH_TEXTURE;
    let raf = 0;
    let lastStage = "";
    let lastProgress = -1;
    const start = performance.now();
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const finish = () => {
      try { sessionStorage.setItem("lavi-solar-intro-seen", "1"); } catch {}
      setVisible(false);
    };

    const draw = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / INTRO_DURATION);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height);
      const nextStage: Stage = elapsed < 3600 ? "system" : elapsed < 5200 ? "scan" : elapsed < 8500 ? "earth" : elapsed < 11000 ? "india" : "done";
      if (nextStage !== lastStage) { lastStage = nextStage; setStage(nextStage); }
      const nextProgress = Math.round(ratio * 100);
      if (nextProgress !== lastProgress && (nextProgress === 100 || nextProgress % 5 === 0)) { lastProgress = nextProgress; setProgress(nextProgress); }

      ctx.clearRect(0, 0, width, height);
      const background = ctx.createRadialGradient(cx * .86, cy * .7, 0, cx, cy, Math.max(width, height) * .85);
      background.addColorStop(0, "#111d38");
      background.addColorStop(.38, "#080f21");
      background.addColorStop(.76, "#030711");
      background.addColorStop(1, "#010208");
      ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);

      // Soft distant nebula clouds, kept deliberately subtle.
      for (let cloud = 0; cloud < 5; cloud++) {
        const px = width * (.12 + seeded(cloud + 40) * .78);
        const py = height * (.12 + seeded(cloud + 80) * .76);
        const radius = scale * (.12 + seeded(cloud + 120) * .13);
        const haze = ctx.createRadialGradient(px, py, 0, px, py, radius);
        haze.addColorStop(0, cloud % 2 ? "rgba(73,91,160,.10)" : "rgba(43,126,151,.09)");
        haze.addColorStop(1, "rgba(12,24,54,0)");
        ctx.fillStyle = haze; ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
      }

      // Stable, irregular star positions with varied size and restrained twinkle.
      for (let star = 0; star < 260; star++) {
        const sx = seeded(star + 1) * width;
        const sy = seeded(star + 701) * height;
        const twinkle = .25 + .55 * (.5 + .5 * Math.sin(elapsed * (.00045 + seeded(star + 901) * .0012) + star));
        const radius = .35 + seeded(star + 1301) * (star % 31 === 0 ? 1.5 : .7);
        ctx.fillStyle = "rgba(218,232,255," + twinkle + ")";
        ctx.beginPath(); ctx.arc(sx, sy, radius, 0, Math.PI * 2); ctx.fill();
      }
      // A few distant stars glow softly.
      for (let star = 0; star < 12; star++) {
        const sx = seeded(star + 1801) * width;
        const sy = seeded(star + 1901) * height;
        ctx.fillStyle = "rgba(150,203,255,.18)";
        ctx.beginPath(); ctx.arc(sx, sy, 2.2, 0, Math.PI * 2); ctx.fill();
      }

      const earthX = cx + scale * .19;
      const earthY = cy + scale * .015;
      const planets = [
        { orbit: .115, radius: 4, colors: ["#c8c2b9", "#696b70"], type: "mercury" },
        { orbit: .165, radius: 6, colors: ["#e9c18f", "#986c4a"], type: "venus" },
        { orbit: .225, radius: 8, colors: ["#8ed8ff", "#07549a", "#031b48"], type: "earth" },
        { orbit: .285, radius: 6, colors: ["#e99a72", "#a34f38"], type: "mars" },
        { orbit: .37, radius: 17, colors: ["#f4d7a0", "#b9784e", "#513a37"], type: "jupiter" },
        { orbit: .46, radius: 14, colors: ["#f5dfad", "#9e7951"], type: "saturn" },
        { orbit: .55, radius: 10, colors: ["#a7e5ed", "#3c859b"], type: "uranus" },
        { orbit: .63, radius: 10, colors: ["#8ca9ff", "#263d9b"], type: "neptune" },
      ];
      const camera = smooth((elapsed - 4900) / 2600);
      const contraction = 1 - camera * .91;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(contraction, contraction); ctx.translate(-cx, -cy);
      planets.forEach((item, index) => {
        const orbit = scale * item.orbit;
        ctx.strokeStyle = "rgba(150,184,225,.13)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(cx, cy, orbit, orbit * .57, -.08, 0, Math.PI * 2); ctx.stroke();
        const angle = elapsed * .000035 * (index % 2 ? -1 : 1) + index * .83;
        const x = item.type === "earth" ? earthX : cx + Math.cos(angle) * orbit;
        const y = item.type === "earth" ? earthY : cy + Math.sin(angle) * orbit * .57;
        drawPlanet(ctx, x, y, item.radius, item.colors, item.type, earthTexture, elapsed);
      });
      // Sun with layered corona.
      const sunRadius = scale * .035;
      const corona = ctx.createRadialGradient(cx, cy, sunRadius * .65, cx, cy, sunRadius * 2.8);
      corona.addColorStop(0, "rgba(255,190,91,.42)"); corona.addColorStop(1, "rgba(255,120,40,0)");
      ctx.fillStyle = corona; ctx.beginPath(); ctx.arc(cx, cy, sunRadius * 2.8, 0, Math.PI * 2); ctx.fill();
      drawPlanet(ctx, cx, cy, sunRadius, ["#fff4bc", "#ffb13b", "#f16b27"], "sun", null, elapsed);
      ctx.restore();

      if (elapsed >= 3500 && elapsed < 5800) {
        const pulse = .5 + .5 * Math.sin(elapsed * .006);
        ctx.save();
        ctx.strokeStyle = "rgba(111,213,255,.9)"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 8]);
        ctx.beginPath(); ctx.arc(earthX, earthY, 17 + pulse * 8, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(111,213,255,.4)"; ctx.beginPath();
        ctx.moveTo(earthX - 38, earthY); ctx.lineTo(earthX + 38, earthY);
        ctx.moveTo(earthX, earthY - 38); ctx.lineTo(earthX, earthY + 38); ctx.stroke();
        ctx.fillStyle = "#a9e5ff"; ctx.font = "11px ui-monospace, monospace";
        ctx.fillText("TARGET ACQUIRED  /  EARTH", earthX + 28, earthY - 26);
        ctx.restore();
      }

      if (elapsed >= 5200 && elapsed < 8600) {
        const zoom = smooth((elapsed - 5200) / 2700);
        const radius = 8 + (scale * .36 - 8) * zoom;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(radius / 8, radius / 8);
        ctx.translate(-earthX, -earthY);
        drawPlanet(ctx, earthX, earthY, 8, ["#8ed8ff", "#07549a", "#031b48"], "earth", earthTexture, elapsed);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = zoom;
        ctx.strokeStyle = "rgba(113,205,255,.9)";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#43baff"; ctx.shadowBlur = 34;
        ctx.beginPath(); ctx.arc(cx, cy, radius + 3, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      // Real map replaces the globe only at the end of the cinematic zoom.
      if (elapsed > 8500) {
        const fade = smooth((elapsed - 8500) / 1800);
        ctx.fillStyle = "rgba(1,5,12," + (1 - fade) + ")";
        ctx.fillRect(0, 0, width, height);
      }
      if (elapsed > 9000) {
        const alpha = smooth((elapsed - 9000) / 700);
        ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = "center"; ctx.fillStyle = "#e5f5ff";
        ctx.font = "600 12px ui-monospace, monospace"; ctx.fillText("LOCATION CONFIRMED", cx, cy + scale * .43);
        ctx.font = "500 38px Inter, system-ui, sans-serif"; ctx.fillText("INDIA", cx, cy + scale * .49);
        ctx.font = "11px ui-monospace, monospace"; ctx.fillStyle = "rgba(220,239,255,.68)";
        ctx.fillText("A NEW PERSPECTIVE BEGINS HERE", cx, cy + scale * .49 + 26);
        ctx.restore();
      }
      if (ratio >= 1) { finish(); return; }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      earthTexture.src = "";
    };
  }, [visible]);

  if (!visible) return null;
  const skip = () => {
    try { sessionStorage.setItem("lavi-solar-intro-seen", "1"); } catch {}
    setVisible(false);
  };
  const caption = stage === "system" ? "MAPPING THE SOLAR SYSTEM" : stage === "scan" ? "SCANNING PLANETARY SIGNATURES" : stage === "earth" ? "EARTH IDENTIFIED · LOCKING COORDINATES" : stage === "india" ? "ZOOMING INTO INDIA" : "";
  return (
    <div className="solar-intro" role="dialog" aria-label="Solar system introduction">
      <canvas ref={canvasRef} className="solar-intro-canvas" aria-hidden="true" />
      {stage === "india" && (
        <div className="solar-india-map" aria-label="OpenStreetMap view of India">
          <iframe title="Real map of India from OpenStreetMap" src="https://www.openstreetmap.org/export/embed.html?bbox=68.1%2C6.5%2C97.4%2C35.7&layer=mapnik&marker=22.0%2C79.0" loading="eager" />
          <div className="solar-map-credit"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors · ODbL</a></div>
        </div>
      )}
      <div className="solar-intro-hud"><span className="solar-live-dot" /><span>DEEP SPACE NAVIGATION</span><span className="solar-hud-progress">{String(progress).padStart(2, "0")}%</span></div>
      <div className="solar-intro-caption"><span>{caption}</span><i /></div>
      <button className="solar-intro-skip" onClick={skip}>Skip intro <span>↗</span></button>
      <div className="solar-nasa-credit">Earth imagery: NASA Earth Observatory · Blue Marble</div>
    </div>
  );
}
