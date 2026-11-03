import { useEffect, useRef, useState } from "react";

type Stage = "system" | "scan" | "earth" | "india" | "done";

const INTRO_DURATION = 11200;

function smooth(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function planet(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colors: string[], type: string) {
  const g = ctx.createRadialGradient(x - r * .36, y - r * .42, r * .05, x, y, r * 1.15);
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  ctx.save();
  ctx.shadowColor = colors[0];
  ctx.shadowBlur = r * .8;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  if (type === "earth") {
    ctx.fillStyle = "rgba(63,157,111,.9)";
    ctx.beginPath(); ctx.moveTo(x-r*.75,y-r*.1); ctx.bezierCurveTo(x-r*.55,y-r*.7,x-r*.1,y-r*.5,x+r*.02,y-r*.22); ctx.bezierCurveTo(x+r*.12,y+r*.02,x-r*.12,y+r*.12,x-r*.02,y+r*.42); ctx.bezierCurveTo(x-r*.28,y+r*.56,x-r*.5,y+r*.24,x-r*.75,y-r*.1); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+r*.16,y-r*.62); ctx.bezierCurveTo(x+r*.65,y-r*.55,x+r*.62,y-r*.12,x+r*.42,y+r*.02); ctx.bezierCurveTo(x+r*.25,y+r*.2,x+r*.5,y+r*.5,x+r*.25,y+r*.72); ctx.bezierCurveTo(x+r*.06,y+r*.4,x+r*.04,y+r*.06,x+r*.16,y-r*.62); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.24)"; ctx.lineWidth = Math.max(1,r*.025);
    for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(x,y,r*.9, r*(.18+Math.abs(i)*.12),-.35,0,Math.PI*2);ctx.stroke();}
  } else if (type === "jupiter" || type === "saturn") {
    for (let i=-3;i<=3;i++){ctx.fillStyle=i%2?"rgba(255,235,205,.25)":"rgba(95,65,48,.18)";ctx.fillRect(x-r,y+i*r*.22,r*2,r*.11);}
  } else if (type === "sun") {
    ctx.globalAlpha=.35; for(let i=0;i<9;i++){ctx.strokeStyle="#fff2b2";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r*(.45+i*.07),0,Math.PI*2);ctx.stroke();}
  }
  ctx.restore(); ctx.restore();
  if (type === "saturn") {
    ctx.save(); ctx.translate(x,y); ctx.rotate(-.28); ctx.strokeStyle="rgba(226,197,153,.78)"; ctx.lineWidth=r*.2; ctx.beginPath(); ctx.ellipse(0,0,r*1.65,r*.48,0,0,Math.PI*2); ctx.stroke(); ctx.strokeStyle="rgba(255,235,195,.48)"; ctx.lineWidth=r*.045; ctx.beginPath(); ctx.ellipse(0,0,r*1.85,r*.55,0,0,Math.PI*2); ctx.stroke(); ctx.restore();
  }
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
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) { setVisible(false); return; }
    let frame = 0;
    let raf = 0;
    const start = performance.now();
    let lastStage = "";
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize(); window.addEventListener("resize", resize);
    const draw = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / INTRO_DURATION);
      const w = window.innerWidth, h = window.innerHeight;
      const cx=w/2, cy=h/2;
      const nextStage: Stage = elapsed < 3500 ? "system" : elapsed < 5000 ? "scan" : elapsed < 7900 ? "earth" : elapsed < 10300 ? "india" : "done";
      if(nextStage!==lastStage){lastStage=nextStage;setStage(nextStage);}
      setProgress(Math.round(p*100));
      ctx.clearRect(0,0,w,h);
      const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.8);
      bg.addColorStop(0,"#0b1830"); bg.addColorStop(.58,"#050a16"); bg.addColorStop(1,"#02040a");
      ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
      // Deep-space stars
      for(let i=0;i<145;i++){
        const sx=((i*173.31)%w), sy=((i*97.73)%h);
        const twinkle=.35+.45*Math.sin(elapsed*.001+i*2);
        ctx.fillStyle="rgba(205,225,255,"+twinkle+")";ctx.beginPath();ctx.arc(sx,sy,(i%7===0)?1.35:.65,0,Math.PI*2);ctx.fill();
      }
      const earthX=cx+Math.min(w,h)*.19, earthY=cy+Math.min(w,h)*.015;
      const planets=[
        {a:Math.min(w,h)*.12,r:4,c:["#aaa39a","#655f5a"],t:"rock"},
        {a:Math.min(w,h)*.17,r:7,c:["#e5bd83","#986a43"],t:"venus"},
        {a:Math.min(w,h)*.23,r:8,c:["#8ed8ff","#07549a","#031b48"],t:"earth"},
        {a:Math.min(w,h)*.29,r:6,c:["#e99a72","#a34f38"],t:"mars"},
        {a:Math.min(w,h)*.38,r:18,c:["#f4d7a0","#b9784e","#513a37"],t:"jupiter"},
        {a:Math.min(w,h)*.47,r:15,c:["#f5dfad","#9e7951"],t:"saturn"},
        {a:Math.min(w,h)*.55,r:10,c:["#a7e5ed","#3c859b"],t:"uranus"},
        {a:Math.min(w,h)*.62,r:10,c:["#8ca9ff","#263d9b"],t:"neptune"},
      ];
      const systemT=1-smooth((elapsed-2600)/1100);
      const camera=smooth((elapsed-4800)/2100);
      const targetEarthR=Math.min(w,h)*.34;
      const baseEarthR=8;
      // Solar system composition contracts toward the Earth target as camera approaches.
      ctx.save();ctx.translate(cx,cy);ctx.scale(1-camera*.94,1-camera*.94);ctx.translate(-cx,-cy);
      for(let i=0;i<planets.length;i++){
        const item=planets[i]; const orbit=item.a;
        ctx.strokeStyle="rgba(146,180,226,.14)";ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(cx,cy,orbit,orbit*.56,0,0,Math.PI*2);ctx.stroke();
        const angle=elapsed*.000045*(i%2?-1:1)+i*.8;
        const x=cx+Math.cos(angle)*orbit, y=cy+Math.sin(angle)*orbit*.56;
        if(item.t==="earth"){planet(ctx,x,y,8,item.c,"earth");}
        else planet(ctx,x,y,item.r,item.c,item.t);
      }
      planet(ctx,cx,cy,Math.min(w,h)*.035,["#fff4bc","#ffb13b","#f16b27"],"sun");
      ctx.restore();
      if(elapsed>=3300 && elapsed<5700){
        const pulse=.5+.5*Math.sin(elapsed*.008);
        ctx.save();ctx.strokeStyle="rgba(105,208,255,.8)";ctx.lineWidth=1.5;ctx.setLineDash([5,7]);ctx.beginPath();ctx.arc(earthX,earthY,18+pulse*7,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
        ctx.strokeStyle="rgba(105,208,255,.35)";ctx.beginPath();ctx.moveTo(earthX-35,earthY);ctx.lineTo(earthX+35,earthY);ctx.moveTo(earthX,earthY-35);ctx.lineTo(earthX,earthY+35);ctx.stroke();
        ctx.fillStyle="#8edcff";ctx.font="11px monospace";ctx.fillText("TARGET ACQUIRED  //  EARTH",earthX+28,earthY-27);ctx.restore();
      }
      if(elapsed>=5000 && elapsed<8000){
        const t=smooth((elapsed-5000)/2200);
        ctx.save();ctx.translate(cx,cy);ctx.scale(1+t*(targetEarthR/baseEarthR-1),1+t*(targetEarthR/baseEarthR-1));ctx.translate(-earthX,-earthY);
        planet(ctx,earthX,earthY,baseEarthR,["#8ed8ff","#07549a","#031b48"],"earth");
        ctx.restore();
        // Full-screen globe with atmospheric rim.
        const r=baseEarthR+(targetEarthR-baseEarthR)*t;
        ctx.save();ctx.globalAlpha=t;ctx.strokeStyle="rgba(108,198,255,.8)";ctx.lineWidth=5;ctx.shadowColor="#4bbcff";ctx.shadowBlur=36;ctx.beginPath();ctx.arc(cx,cy,r+4,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
      if(elapsed>=7900){
        const t=smooth((elapsed-7900)/1800);
        const globeR=Math.min(w,h)*.38;
        ctx.save();ctx.globalAlpha=1-t*.35;
        const eg=ctx.createRadialGradient(cx-globeR*.3,cy-globeR*.35,globeR*.05,cx,cy,globeR);
        eg.addColorStop(0,"#45a9e5");eg.addColorStop(.62,"#0d4c86");eg.addColorStop(1,"#06172e");
        ctx.fillStyle=eg;ctx.shadowColor="#36aaff";ctx.shadowBlur=55;ctx.beginPath();ctx.arc(cx,cy,globeR,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        ctx.save();ctx.beginPath();ctx.arc(cx,cy,globeR,0,Math.PI*2);ctx.clip();
        // Simplified continent silhouettes, then a highlighted India locator.
        ctx.fillStyle="#5eaa76";ctx.beginPath();ctx.moveTo(cx-globeR*.55,cy-globeR*.3);ctx.lineTo(cx-globeR*.2,cy-globeR*.48);ctx.lineTo(cx+globeR*.05,cy-globeR*.28);ctx.lineTo(cx-globeR*.08,cy+globeR*.02);ctx.lineTo(cx-globeR*.3,cy+globeR*.2);ctx.lineTo(cx-globeR*.48,cy+.1*globeR);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.moveTo(cx+globeR*.1,cy-globeR*.45);ctx.lineTo(cx+globeR*.48,cy-globeR*.28);ctx.lineTo(cx+globeR*.42,cy+globeR*.04);ctx.lineTo(cx+globeR*.2,cy+globeR*.14);ctx.lineTo(cx+globeR*.1,cy-globeR*.45);ctx.fill();
        ctx.beginPath();ctx.moveTo(cx+globeR*.34,cy+globeR*.03);ctx.lineTo(cx+globeR*.46,cy+globeR*.17);ctx.lineTo(cx+globeR*.38,cy+globeR*.48);ctx.lineTo(cx+globeR*.25,cy+globeR*.29);ctx.fill();
        const ix=cx+globeR*.18, iy=cy+globeR*.02;
        ctx.fillStyle="#f2c77a";ctx.beginPath();ctx.moveTo(ix,iy-globeR*.13);ctx.lineTo(ix+globeR*.075,iy-globeR*.02);ctx.lineTo(ix+globeR*.035,iy+globeR*.2);ctx.lineTo(ix-globeR*.03,iy+globeR*.29);ctx.lineTo(ix-globeR*.075,iy+.04*globeR);ctx.closePath();ctx.fill();
        ctx.restore();ctx.restore();
        // Scanner ring and map transition
        ctx.save();ctx.strokeStyle="rgba(118,220,255,.85)";ctx.lineWidth=1.5;ctx.setLineDash([4,7]);ctx.beginPath();ctx.arc(cx,cy,globeR*(.25+t*.9),0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
        if(t>.3){
          const mapT=smooth((t-.3)/.7);
          ctx.save();ctx.globalAlpha=mapT;ctx.translate(cx,cy);ctx.scale(1+mapT*2.2,1+mapT*2.2);ctx.translate(-cx,-cy);
          ctx.fillStyle="#143f38";ctx.strokeStyle="#b5e4bd";ctx.lineWidth=2;
          ctx.beginPath();ctx.moveTo(cx,cy-globeR*.15);ctx.lineTo(cx+globeR*.08,cy-globeR*.02);ctx.lineTo(cx+globeR*.04,cy+globeR*.2);ctx.lineTo(cx-globeR*.03,cy+globeR*.3);ctx.lineTo(cx-globeR*.09,cy+globeR*.03);ctx.closePath();ctx.fill();ctx.stroke();
          ctx.restore();
        }
      }
      // Scanner sweep line
      if(elapsed>3000 && elapsed<8500){
        const sy=(elapsed*.16)%(h+100)-50;
        const line=ctx.createLinearGradient(0,sy-30,0,sy+30);line.addColorStop(0,"rgba(75,190,255,0)");line.addColorStop(.5,"rgba(75,190,255,.24)");line.addColorStop(1,"rgba(75,190,255,0)");
        ctx.fillStyle=line;ctx.fillRect(0,sy-30,w,60);
      }
      if(elapsed>8000){
        const a=smooth((elapsed-8000)/650);
        ctx.save();ctx.globalAlpha=a;ctx.fillStyle="#dff5ff";ctx.textAlign="center";
        ctx.font="600 12px monospace";ctx.fillText("LOCATION CONFIRMED",cx,cy+Math.min(w,h)*.43);
        ctx.font="500 38px Inter, system-ui, sans-serif";ctx.fillText("INDIA",cx,cy+Math.min(w,h)*.49);
        ctx.font="11px monospace";ctx.fillStyle="rgba(220,239,255,.65)";ctx.fillText("A NEW PERSPECTIVE BEGINS HERE",cx,cy+Math.min(w,h)*.49+26);ctx.restore();
      }
      if(p>=1){finish();return;}
      raf=requestAnimationFrame(draw);
    };
    const finish=()=>{try{sessionStorage.setItem("lavi-solar-intro-seen","1");}catch{} setVisible(false);};
    raf=requestAnimationFrame(draw);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[visible]);

  if(!visible)return null;
  const skip=()=>{try{sessionStorage.setItem("lavi-solar-intro-seen","1");}catch{}setVisible(false);};
  const caption=stage==="system"?"MAPPING THE SOLAR SYSTEM":stage==="scan"?"SCANNING PLANETARY SIGNATURES":stage==="earth"?"EARTH IDENTIFIED · LOCKING COORDINATES":stage==="india"?"ZOOMING INTO INDIA":"";
  return <div className="solar-intro" role="dialog" aria-label="Solar system introduction">
    <canvas ref={canvasRef} className="solar-intro-canvas" aria-hidden="true"/>
    <div className="solar-intro-hud"><span className="solar-live-dot"/> <span>DEEP SPACE NAVIGATION</span><span className="solar-hud-progress">{String(progress).padStart(2,"0")}%</span></div>
    <div className="solar-intro-caption"><span>{caption}</span><i/></div>
    <button className="solar-intro-skip" onClick={skip}>Skip intro <span>↗</span></button>
  </div>;
}
