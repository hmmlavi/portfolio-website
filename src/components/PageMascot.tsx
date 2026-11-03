import { BookOpen, Code2, Lightbulb, Rocket, Trophy, BriefcaseBusiness, Sparkles } from "lucide-react";

type MascotPose = "coding" | "trophy" | "building" | "learning" | "work" | "ideas";

const scenes: Record<MascotPose, { label: string; line: string; Icon: typeof Code2; accent: string }> = {
  coding: { label: "IN THE ZONE", line: "one more commit…", Icon: Code2, accent: "#8b9cff" },
  trophy: { label: "LITTLE WINS", line: "made it count.", Icon: Trophy, accent: "#e7b65d" },
  building: { label: "MAKING THINGS", line: "built, tested, repeat.", Icon: Rocket, accent: "#69c8b2" },
  learning: { label: "STILL CURIOUS", line: "always learning.", Icon: BookOpen, accent: "#a99af5" },
  work: { label: "ON THE JOURNEY", line: "getting things done.", Icon: BriefcaseBusiness, accent: "#78b8e8" },
  ideas: { label: "WHAT IF…", line: "ideas welcome.", Icon: Lightbulb, accent: "#e9a5b7" },
};

export default function PageMascot({ pose = "coding", compact = false }: { pose?: MascotPose; compact?: boolean }) {
  const scene = scenes[pose];
  const Prop = scene.Icon;
  return (
    <aside className={`page-mascot page-mascot--${pose}${compact ? " page-mascot--compact" : ""}`} aria-label={`Illustrated mascot: ${scene.label.toLowerCase()}`}>
      <div className="mascot-orbit mascot-orbit--one" aria-hidden="true" />
      <div className="mascot-orbit mascot-orbit--two" aria-hidden="true" />
      <div className="mascot-float-tag"><Sparkles size={12} /> {scene.label}</div>
      <div className="mascot-figure" aria-hidden="true">
        <svg viewBox="0 0 250 205" role="img" className="mascot-svg">
          <defs>
            <linearGradient id="mascot-shirt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8d9ee8"/><stop offset="1" stopColor="#5867ad"/></linearGradient>
            <linearGradient id="mascot-pants" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#303b55"/><stop offset="1" stopColor="#1c263a"/></linearGradient>
            <linearGradient id="mascot-skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4c9a8"/><stop offset="1" stopColor="#d99e7b"/></linearGradient>
            <linearGradient id="mascot-laptop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dce5f2"/><stop offset="1" stopColor="#8796ad"/></linearGradient>
            <filter id="mascot-shadow"><feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#111827" floodOpacity=".22"/></filter>
          </defs>
          <ellipse cx="128" cy="187" rx="82" ry="10" fill="#111827" opacity=".13"/>
          {/* legs dangling from the card edge */}
          <path d="M103 137 Q76 148 63 170 L77 178 Q104 163 126 160 L145 146Z" fill="url(#mascot-pants)" filter="url(#mascot-shadow)"/>
          <path d="M143 139 Q166 150 176 171 L190 169 Q187 145 164 128Z" fill="#35425e"/>
          <path d="M62 169 Q53 176 57 182 Q68 187 82 178 L78 171Z" fill="#e7b18f"/>
          <path d="M176 168 Q184 178 198 177 Q207 174 199 168 L189 164Z" fill="#e7b18f"/>
          {/* torso */}
          <path d="M91 78 Q119 64 151 81 L169 137 Q132 157 91 137 L78 105Z" fill="url(#mascot-shirt)" filter="url(#mascot-shadow)"/>
          <path d="M104 79 Q120 91 140 80" fill="none" stroke="#c4cdf4" strokeWidth="3" opacity=".55"/>
          {/* neck and face */}
          <path d="M115 70 L115 85 Q128 94 140 82 L137 68Z" fill="url(#mascot-skin)"/>
          <ellipse cx="128" cy="48" rx="29" ry="33" fill="url(#mascot-skin)" filter="url(#mascot-shadow)"/>
          {/* hair, deliberately clean-shaven */}
          <path d="M99 47 Q94 13 126 12 Q159 10 158 42 Q148 29 139 28 Q125 38 105 33Z" fill="#252536"/>
          <path d="M100 39 Q91 28 103 19 Q100 35 115 32" fill="#252536"/>
          <path d="M137 24 Q151 19 155 34 Q146 29 137 31" fill="#252536"/>
          <ellipse cx="117" cy="49" rx="2.2" ry="2.7" fill="#303044"/><ellipse cx="139" cy="49" rx="2.2" ry="2.7" fill="#303044"/>
          <path d="M121 62 Q129 68 137 61" fill="none" stroke="#9e5f53" strokeWidth="2" strokeLinecap="round"/>
          <path d="M97 50 Q92 53 99 59" fill="none" stroke="#d18f73" strokeWidth="3" strokeLinecap="round"/>
          {/* arms */}
          <path d="M91 91 Q72 98 76 119 L103 126 L111 114 L95 108Z" fill="url(#mascot-shirt)"/>
          <path d="M151 91 Q175 93 169 115 L148 125 L139 113 L157 106Z" fill="url(#mascot-shirt)"/>
          <path d="M76 118 Q82 128 96 126 L104 120 Q101 113 91 116Z" fill="url(#mascot-skin)"/>
          <path d="M148 124 Q159 130 170 117 L174 110 Q164 108 158 116Z" fill="url(#mascot-skin)"/>
          {/* laptop */}
          <g className="mascot-laptop" filter="url(#mascot-shadow)">
            <path d="M82 111 L163 111 L174 151 L73 151Z" fill="url(#mascot-laptop)" stroke="#71819b" strokeWidth="2"/>
            <path d="M73 151 L174 151 L184 158 Q183 162 176 162 L67 162 Q62 160 68 155Z" fill="#9baac0"/>
            <rect x="91" y="119" width="64" height="27" rx="3" fill="#202b43"/>
            <path d="M100 129 L111 129 M100 135 L122 135 M100 141 L116 141" stroke="#8ca8ff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M132 129 L146 129 M132 135 L143 135" stroke="#75d4bd" strokeWidth="2" strokeLinecap="round"/>
          </g>
          {pose === "trophy" && <g transform="translate(174 65)" filter="url(#mascot-shadow)"><path d="M8 4 H38 V24 Q36 43 23 43 Q10 43 8 24Z" fill="#e9b84f" stroke="#c78d2d" strokeWidth="2"/><path d="M8 10 H1 Q0 26 13 27 M38 10 H45 Q46 26 33 27" fill="none" stroke="#e9b84f" strokeWidth="5"/><path d="M23 43 V52 M13 54 H33" stroke="#c78d2d" strokeWidth="5" strokeLinecap="round"/><path d="M23 11 L26 18 L33 19 L28 24 L29 31 L23 27 L17 31 L18 24 L13 19 L20 18Z" fill="#fff2bf"/></g>}
          {pose === "building" && <g transform="translate(178 62)" filter="url(#mascot-shadow)"><path d="M22 0 L43 39 L22 32 L1 39Z" fill="#70cdb7"/><path d="M22 32 V54" stroke="#4a9d8c" strokeWidth="5"/><path d="M12 44 L22 54 L32 44" fill="none" stroke="#4a9d8c" strokeWidth="4"/></g>}
          {pose === "learning" && <g transform="translate(177 70)" filter="url(#mascot-shadow)"><path d="M0 5 Q15 -2 29 7 V42 Q14 34 0 41Z" fill="#b9aaf4"/><path d="M29 7 Q43 -2 58 5 V41 Q43 34 29 42Z" fill="#8f80d4"/><path d="M7 15 L21 15 M7 23 L21 23 M36 15 L50 15 M36 23 L50 23" stroke="#fff" strokeWidth="2" opacity=".8"/></g>}
          {pose === "work" && <g transform="translate(177 74)" filter="url(#mascot-shadow)"><rect x="0" y="12" width="46" height="34" rx="6" fill="#78b8e8"/><path d="M14 12 V5 H32 V12 M0 25 H46" fill="none" stroke="#d9efff" strokeWidth="4"/><path d="M20 24 H27 V30 H20Z" fill="#d9efff"/></g>}
          {pose === "ideas" && <g transform="translate(183 65)" filter="url(#mascot-shadow)"><path d="M23 0 Q4 0 5 20 Q6 31 16 37 V45 H30 V37 Q41 28 41 19 Q41 0 23 0Z" fill="#f1c56d"/><path d="M16 49 H30 M18 54 H28" stroke="#c28c42" strokeWidth="4" strokeLinecap="round"/><path d="M23 -9 V-15 M-2 12 L-8 9 M48 12 L54 9" stroke="#e9b65c" strokeWidth="3" strokeLinecap="round"/></g>}
        </svg>
      </div>
      <div className="mascot-caption"><span className="mascot-caption-dot" style={{ background: scene.accent }} /><span>{scene.line}</span><Prop size={14} style={{ color: scene.accent }} /></div>
    </aside>
  );
}
