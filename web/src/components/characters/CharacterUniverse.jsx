import React from 'react';

/**
 * NextOpportunityFind Character Universe
 * Original characters designed specifically for tech career acceleration:
 * 1. Nova - The Astro Career Guide
 * 2. Pixel - The DSA & Code Spark
 * 3. Lexi - The ATS & Resume Wordsmith
 * 4. Zenith - The Mock Interview Sensei Orb
 */

// ==========================================
// 1. NOVA (The Astro Career Guide)
// ==========================================
export function NovaCharacter({ 
  pose = 'idle', // 'idle' | 'welcome' | 'celebrate' | 'analyze' | 'streak' | 'oops'
  size = 120,
  glow = true,
  className = ''
}) {
  return (
    <div 
      className={`character-mascot nova-character ${pose} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: glow ? 'drop-shadow(0 8px 24px rgba(99, 102, 241, 0.45))' : 'none',
        userSelect: 'none'
      }}
    >
      <svg 
        viewBox="0 0 160 160" 
        width="100%" 
        height="100%" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="novaBody" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#818CF8" />
            <stop offset="0.5" stopColor="#6366F1" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="novaVisor" x1="40" y1="50" x2="120" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" />
            <stop offset="1" stopColor="#1E1B4B" />
          </linearGradient>
          <linearGradient id="novaGlow" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="1" stopColor="#C084FC" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="novaEye" cx="50%" cy="50%" r="50%">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#0284C7" />
          </radialGradient>
        </defs>

        {/* Thruster Aura & Flame */}
        <ellipse cx="80" cy="142" rx="28" ry="8" fill="#6366f1" opacity="0.35" />
        <path 
          d="M72 134 Q80 156 88 134 Z" 
          fill="#38BDF8" 
          opacity="0.9"
          className="nova-thruster-flame"
        />
        <path 
          d="M75 134 Q80 148 85 134 Z" 
          fill="#FDE047" 
          opacity="0.95"
        />

        {/* Floating Halo Antenna */}
        <path d="M80 40 V20" stroke="#818CF8" strokeWidth="4" strokeLinecap="round" />
        <circle cx="80" cy="16" r="8" fill="#F43F5E" />
        <circle cx="80" cy="16" r="4" fill="#FFE4E6" />
        {pose === 'streak' && (
          <path d="M80 4 Q86 12 80 18 Q74 12 80 4" fill="#F59E0B" />
        )}

        {/* Outer Head & Body Shell */}
        <rect 
          x="36" 
          y="40" 
          width="88" 
          height="86" 
          rx="36" 
          fill="url(#novaBody)" 
          stroke="#A5B4FC" 
          strokeWidth="3.5" 
        />

        {/* Gloss highlight on head */}
        <path 
          d="M52 46 Q80 38 108 46" 
          stroke="#E0E7FF" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          opacity="0.75" 
        />

        {/* Visor Screen */}
        <rect 
          x="48" 
          y="58" 
          width="64" 
          height="42" 
          rx="18" 
          fill="url(#novaVisor)" 
          stroke="#4338CA" 
          strokeWidth="2.5" 
        />

        {/* Expressive LED Eyes & Face based on Pose */}
        {pose === 'celebrate' ? (
          <g>
            {/* Star Eyes for Celebration */}
            <path d="M64 74 L66 79 L71 80 L67 84 L68 89 L64 86 L60 89 L61 84 L57 80 L62 79 Z" fill="#FDE047" />
            <path d="M96 74 L98 79 L103 80 L99 84 L100 89 L96 86 L92 89 L93 84 L89 80 L94 79 Z" fill="#FDE047" />
            <path d="M72 88 Q80 96 88 88" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : pose === 'analyze' ? (
          <g>
            {/* Scanning Eye Beam */}
            <circle cx="64" cy="78" r="7" fill="url(#novaEye)" />
            <circle cx="96" cy="78" r="7" fill="url(#novaEye)" />
            <line x1="50" y1="78" x2="110" y2="78" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
            <rect x="74" y="86" width="12" height="3" rx="1.5" fill="#38BDF8" />
          </g>
        ) : pose === 'oops' ? (
          <g>
            {/* Confused / Oops Eyes */}
            <circle cx="64" cy="76" r="6" fill="#F43F5E" />
            <circle cx="96" cy="76" r="4" fill="#F43F5E" />
            <path d="M73 90 Q80 84 87 90" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            {/* Friendly Big Glowing Eyes */}
            <circle cx="64" cy="77" r="7.5" fill="url(#novaEye)" />
            <circle cx="66.5" cy="74.5" r="2.5" fill="#FFFFFF" />
            <circle cx="96" cy="77" r="7.5" fill="url(#novaEye)" />
            <circle cx="98.5" cy="74.5" r="2.5" fill="#FFFFFF" />
            {/* Sweet Smile */}
            <path d="M74 87 Q80 92 86 87" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
            {/* Rosy Cheeks */}
            <circle cx="53" cy="85" r="3" fill="#F43F5E" opacity="0.75" />
            <circle cx="107" cy="85" r="3" fill="#F43F5E" opacity="0.75" />
          </g>
        )}

        {/* Arms / Hands */}
        {pose === 'welcome' || pose === 'celebrate' ? (
          <g>
            {/* Waving Arm Left */}
            <path d="M38 78 Q22 60 20 44" stroke="#818CF8" strokeWidth="7" strokeLinecap="round" />
            <circle cx="20" cy="42" r="7" fill="#C7D2FE" />
            {/* Arm Right Up */}
            <path d="M122 78 Q138 60 140 44" stroke="#818CF8" strokeWidth="7" strokeLinecap="round" />
            <circle cx="140" cy="42" r="7" fill="#C7D2FE" />
          </g>
        ) : pose === 'analyze' ? (
          <g>
            {/* Magnifier in hand */}
            <path d="M38 88 Q30 96 36 110" stroke="#818CF8" strokeWidth="7" strokeLinecap="round" />
            <circle cx="36" cy="110" r="6" fill="#C7D2FE" />
            <path d="M122 88 Q132 94 136 82" stroke="#818CF8" strokeWidth="7" strokeLinecap="round" />
            <circle cx="140" cy="78" r="10" stroke="#FDE047" strokeWidth="3" fill="none" />
            <line x1="147" y1="85" x2="155" y2="93" stroke="#FDE047" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            {/* Resting Friendly Arms */}
            <path d="M38 88 Q26 96 30 110" stroke="#818CF8" strokeWidth="7" strokeLinecap="round" />
            <circle cx="30" cy="110" r="6" fill="#C7D2FE" />
            <path d="M122 88 Q134 96 130 110" stroke="#818CF8" strokeWidth="7" strokeLinecap="round" />
            <circle cx="130" cy="110" r="6" fill="#C7D2FE" />
          </g>
        )}

        {/* Chest Core Emblem */}
        <circle cx="80" cy="114" r="7" fill="#1E1B4B" stroke="#818CF8" strokeWidth="2" />
        <path d="M80 110 L83 115 L77 115 Z" fill="#38BDF8" />
      </svg>
    </div>
  );
}

// ==========================================
// 2. PIXEL (The DSA & Coding Spark Mascot)
// ==========================================
export function PixelCharacter({ 
  pose = 'idle', // 'idle' | 'celebrate' | 'coding' | 'thinking'
  size = 110,
  glow = true,
  className = ''
}) {
  return (
    <div 
      className={`character-mascot pixel-character ${pose} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: glow ? 'drop-shadow(0 8px 24px rgba(6, 182, 212, 0.45))' : 'none',
        userSelect: 'none'
      }}
    >
      <svg viewBox="0 0 160 160" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pixelBody" x1="30" y1="30" x2="130" y2="130" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22D3EE" />
            <stop offset="0.6" stopColor="#06B6D4" />
            <stop offset="1" stopColor="#0891B2" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="80" cy="144" rx="26" ry="7" fill="#0891B2" opacity="0.35" />

        {/* Top Gear / Crown */}
        <g className="pixel-gear-rotate">
          <circle cx="80" cy="24" r="12" fill="#F59E0B" stroke="#FDE047" strokeWidth="2.5" />
          <rect x="76" y="8" width="8" height="6" rx="2" fill="#FDE047" />
          <rect x="76" y="34" width="8" height="6" rx="2" fill="#FDE047" />
          <rect x="64" y="20" width="6" height="8" rx="2" fill="#FDE047" />
          <rect x="90" y="20" width="6" height="8" rx="2" fill="#FDE047" />
          <circle cx="80" cy="24" r="4" fill="#1E293B" />
        </g>
        <rect x="77" y="34" width="6" height="12" fill="#0891B2" />

        {/* Cube Head Body */}
        <rect x="36" y="44" width="88" height="80" rx="20" fill="url(#pixelBody)" stroke="#67E8F9" strokeWidth="3.5" />

        {/* Retro Holographic Sunglasses / Visor */}
        <rect x="46" y="60" width="68" height="30" rx="8" fill="#0F172A" stroke="#F43F5E" strokeWidth="2.5" />
        {/* Neon Code Glasses Display */}
        {pose === 'celebrate' ? (
          <g>
            <path d="M54 75 L62 67 L70 75" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M90 75 L98 67 L106 75" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : (
          <g>
            <text x="52" y="80" fill="#38BDF8" fontFamily="monospace" fontSize="13" fontWeight="bold">&lt;/&gt;</text>
            <text x="86" y="80" fill="#10B981" fontFamily="monospace" fontSize="13" fontWeight="bold">OK</text>
          </g>
        )}

        {/* Pixel Smile */}
        <path d="M68 104 H92" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <circle cx="52" cy="104" r="3" fill="#F59E0B" />
        <circle cx="108" cy="104" r="3" fill="#F59E0B" />

        {/* Legs */}
        <rect x="56" y="124" width="12" height="18" rx="6" fill="#0E7490" />
        <rect x="92" y="124" width="12" height="18" rx="6" fill="#0E7490" />

        {/* Arms */}
        {pose === 'celebrate' ? (
          <g>
            <path d="M36 80 Q18 64 24 50" stroke="#22D3EE" strokeWidth="7" strokeLinecap="round" />
            <path d="M124 80 Q142 64 136 50" stroke="#22D3EE" strokeWidth="7" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <path d="M36 86 Q22 96 28 108" stroke="#22D3EE" strokeWidth="7" strokeLinecap="round" />
            <path d="M124 86 Q138 96 132 108" stroke="#22D3EE" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ==========================================
// 3. LEXI (The ATS & Resume Wordsmith Lynx)
// ==========================================
export function LexiCharacter({ 
  pose = 'idle', // 'idle' | 'writing' | 'inspect' | 'celebrate'
  size = 115,
  glow = true,
  className = ''
}) {
  return (
    <div 
      className={`character-mascot lexi-character ${pose} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: glow ? 'drop-shadow(0 8px 24px rgba(236, 72, 153, 0.45))' : 'none',
        userSelect: 'none'
      }}
    >
      <svg viewBox="0 0 160 160" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lexiBody" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F472B6" />
            <stop offset="0.6" stopColor="#EC4899" />
            <stop offset="1" stopColor="#DB2777" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="80" cy="144" rx="28" ry="7" fill="#BE185D" opacity="0.35" />

        {/* Cyber Lynx Ears */}
        <path d="M42 54 L30 18 L64 38 Z" fill="url(#lexiBody)" stroke="#FBCFE8" strokeWidth="2.5" />
        <path d="M40 46 L34 26 L56 38 Z" fill="#FDE047" />
        <path d="M118 54 L130 18 L96 38 Z" fill="url(#lexiBody)" stroke="#FBCFE8" strokeWidth="2.5" />
        <path d="M120 46 L126 26 L104 38 Z" fill="#FDE047" />

        {/* Head & Body */}
        <rect x="38" y="40" width="84" height="84" rx="30" fill="url(#lexiBody)" stroke="#FDF2F8" strokeWidth="3" />

        {/* Golden Holographic Round Glasses */}
        <circle cx="62" cy="74" r="14" stroke="#FDE047" strokeWidth="3" fill="#1E1B4B" />
        <circle cx="98" cy="74" r="14" stroke="#FDE047" strokeWidth="3" fill="#1E1B4B" />
        <line x1="76" y1="74" x2="84" y2="74" stroke="#FDE047" strokeWidth="3" />

        {/* Sparkling Smart Eyes */}
        <circle cx="62" cy="74" r="6" fill="#38BDF8" />
        <circle cx="64" cy="72" r="2" fill="#FFFFFF" />
        <circle cx="98" cy="74" r="6" fill="#38BDF8" />
        <circle cx="100" cy="72" r="2" fill="#FFFFFF" />

        {/* Whiskers */}
        <line x1="42" y1="88" x2="26" y2="84" stroke="#FBCFE8" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="94" x2="28" y2="96" stroke="#FBCFE8" strokeWidth="2" strokeLinecap="round" />
        <line x1="118" y1="88" x2="134" y2="84" stroke="#FBCFE8" strokeWidth="2" strokeLinecap="round" />
        <line x1="118" y1="94" x2="132" y2="96" stroke="#FBCFE8" strokeWidth="2" strokeLinecap="round" />

        {/* Cute Lynx Nose & Smile */}
        <path d="M78 86 L82 86 L80 90 Z" fill="#FDE047" />
        <path d="M74 94 Q80 98 86 94" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

        {/* Stylus / Quill in Hand */}
        {pose === 'writing' ? (
          <g>
            <path d="M120 88 Q138 90 144 80" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" />
            <path d="M140 76 L154 50 L146 46 L134 72 Z" fill="#FDE047" />
            <polygon points="132,74 136,80 130,82" fill="#1E293B" />
          </g>
        ) : (
          <g>
            <circle cx="80" cy="116" r="6" fill="#FDE047" />
            <path d="M80 112 V120" stroke="#1E1B4B" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ==========================================
// 4. ZENITH (The Mock Interview Sensei Orb)
// ==========================================
export function ZenithCharacter({ 
  pose = 'idle', // 'idle' | 'listening' | 'speaking' | 'celebrate'
  size = 115,
  glow = true,
  className = ''
}) {
  return (
    <div 
      className={`character-mascot zenith-character ${pose} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: glow ? 'drop-shadow(0 8px 24px rgba(16, 185, 129, 0.45))' : 'none',
        userSelect: 'none'
      }}
    >
      <svg viewBox="0 0 160 160" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="zenithOrb" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34D399" />
            <stop offset="0.6" stopColor="#10B981" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Orbiting Audio Rings */}
        <circle cx="80" cy="80" r="54" stroke="#10B981" strokeWidth="2" strokeDasharray="6 6" opacity="0.5" />
        <ellipse cx="80" cy="144" rx="26" ry="6" fill="#059669" opacity="0.3" />

        {/* Studio Headphones Band */}
        <path d="M34 80 C34 44 126 44 126 80" stroke="#0F172A" strokeWidth="9" strokeLinecap="round" />
        <path d="M40 78 C40 50 120 50 120 78" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />

        {/* Main Floating Orb Body */}
        <circle cx="80" cy="80" r="42" fill="url(#zenithOrb)" stroke="#A7F3D0" strokeWidth="3.5" />

        {/* Headphone Ear Cups */}
        <rect x="24" y="66" width="16" height="30" rx="8" fill="#1E293B" stroke="#34D399" strokeWidth="2" />
        <rect x="120" y="66" width="16" height="30" rx="8" fill="#1E293B" stroke="#34D399" strokeWidth="2" />

        {/* Calm Zen Eyes / Audio Wave Visor */}
        {pose === 'listening' ? (
          <g>
            {/* Animated Audio Equalizer Face */}
            <line x1="62" y1="76" x2="62" y2="86" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="71" y1="70" x2="71" y2="92" stroke="#FDE047" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="80" y1="66" x2="80" y2="96" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="89" y1="70" x2="89" y2="92" stroke="#FDE047" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="98" y1="76" x2="98" y2="86" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            {/* Calm Smiling Closed Eyes (Zen) */}
            <path d="M58 76 Q66 84 74 76" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M86 76 Q94 84 102 76" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M74 90 Q80 96 86 90" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
            <circle cx="52" cy="84" r="3" fill="#F43F5E" opacity="0.6" />
            <circle cx="108" cy="84" r="3" fill="#F43F5E" opacity="0.6" />
          </g>
        )}

        {/* Microphone Boom */}
        <path d="M36 86 Q40 108 58 108" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
        <circle cx="62" cy="108" r="5" fill="#F43F5E" />
      </svg>
    </div>
  );
}

export default {
  Nova: NovaCharacter,
  Pixel: PixelCharacter,
  Lexi: LexiCharacter,
  Zenith: ZenithCharacter
};
