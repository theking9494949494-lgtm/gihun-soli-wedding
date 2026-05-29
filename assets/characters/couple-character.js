/* ---------------------------------------------------------------------------
 * couple-character.js
 *  윤기훈 ♥ 한솔이 — Reusable ambient couple character layer
 *  4 styles: chibi-white, chibi-black, pixel, photo
 *  Pure vanilla JS, no dependencies. Self-contained SVG sprites.
 *
 *  Usage:
 *    <script src="assets/characters/couple-character.js"></script>
 *    <script>
 *      CoupleCharacter.init({ style: 'chibi-white', mode: 'walk' });
 *    </script>
 * ------------------------------------------------------------------------- */

(function (global) {
  'use strict';

  /* ── Shared CSS for the ambient layer ────────────────────────────────── */
  const LAYER_CSS = `
    .cc-layer {
      position: fixed;
      left: 0; right: 0; bottom: 0;
      height: 140px;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    }
    .cc-stage {
      position: relative;
      width: 100%; height: 100%;
      pointer-events: none;
    }
    .cc-couple {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 260px;
      height: 170px;
      will-change: transform;
      transform: translateX(0px);
      pointer-events: auto;
      cursor: pointer;
      transition: transform 80ms linear;
    }
    .cc-couple.cc-flip { transform: translateX(var(--cc-x, 0px)) scaleX(-1); }
    .cc-couple svg { display: block; width: 100%; height: 100%; overflow: visible; }

    /* shadow */
    .cc-shadow {
      position: absolute;
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 70%;
      height: 8px;
      background: radial-gradient(ellipse, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 70%);
      filter: blur(1px);
    }

    /* hearts pop on tap */
    .cc-heart {
      position: absolute;
      pointer-events: none;
      font-size: 18px;
      color: #E54B4B;
      animation: cc-heart-rise 1.2s ease-out forwards;
    }
    @keyframes cc-heart-rise {
      0%   { transform: translate(0,0) scale(0.6); opacity: 0; }
      20%  { opacity: 1; transform: translate(0,-12px) scale(1); }
      100% { transform: translate(var(--dx, 8px), -80px) scale(1.1); opacity: 0; }
    }

    /* walk bob */
    @keyframes cc-bob {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-3px); }
    }
    .cc-bob { animation: cc-bob 0.55s ease-in-out infinite; transform-origin: bottom center; }

    /* leg swing (used by chibi) */
    @keyframes cc-leg-l { 0%,100% { transform: rotate(12deg); } 50% { transform: rotate(-12deg); } }
    @keyframes cc-leg-r { 0%,100% { transform: rotate(-12deg); } 50% { transform: rotate(12deg); } }
    .cc-leg-l { animation: cc-leg-l 0.55s ease-in-out infinite; transform-origin: 50% 0%; }
    .cc-leg-r { animation: cc-leg-r 0.55s ease-in-out infinite; transform-origin: 50% 0%; }

    /* tiny arm swing */
    @keyframes cc-arm-l { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } }
    @keyframes cc-arm-r { 0%,100% { transform: rotate(10deg); } 50% { transform: rotate(-10deg); } }
    .cc-arm-l { animation: cc-arm-l 0.55s ease-in-out infinite; transform-origin: 50% 0%; }
    .cc-arm-r { animation: cc-arm-r 0.55s ease-in-out infinite; transform-origin: 50% 0%; }

    /* paused (idle) state */
    .cc-idle .cc-bob, .cc-idle .cc-leg-l, .cc-idle .cc-leg-r,
    .cc-idle .cc-arm-l, .cc-idle .cc-arm-r { animation-play-state: paused; }

    /* pixel render hint */
    .cc-pixel svg { image-rendering: pixelated; image-rendering: crisp-edges; }

    /* style selector chip */
    .cc-switcher {
      position: fixed; top: 12px; right: 12px;
      z-index: 10000; display: flex; gap: 4px;
      background: rgba(255,255,255,0.9);
      border: 1px solid #ddd; border-radius: 999px;
      padding: 4px; backdrop-filter: blur(8px);
      font-family: system-ui, sans-serif; font-size: 11px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }
    .cc-switcher button {
      padding: 6px 10px; border: 0; background: transparent;
      border-radius: 999px; cursor: pointer; color: #555;
      transition: all 0.2s;
    }
    .cc-switcher button:hover { background: #f3f3f3; }
    .cc-switcher button.cc-active { background: #1A1612; color: #fff; }
  `;

  /* ── SVG sprite generators ───────────────────────────────────────────── */

  /* Chibi base — bigger heads, more detail, holding hands visible.
     ViewBox 200x130. Groom centered ~x=70, Bride ~x=130, hands meet at x=100,y=88. */
  function chibiSVG(groomColors, brideColors, label) {
    const G = groomColors;
    const B = brideColors;
    return `
<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" aria-label="${label}">
  <defs>
    <filter id="cc-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="0.3"/>
    </filter>
    <radialGradient id="cc-cheek" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F4B5A5" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#F4B5A5" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- ====================  GROOM (left, ~x=70)  ==================== -->
  <g transform="translate(70,8)">
    <!-- legs (anchored at hip y=78) -->
    <g class="cc-leg-l" transform="translate(-8,82)">
      <path d="M -4 0 Q -5 14 -3 26 L 4 26 Q 5 14 4 0 Z" fill="${G.pants}"/>
      <ellipse cx="0" cy="28" rx="5.5" ry="2.4" fill="${G.shoe}"/>
    </g>
    <g class="cc-leg-r" transform="translate(8,82)">
      <path d="M -4 0 Q -5 14 -3 26 L 4 26 Q 5 14 4 0 Z" fill="${G.pants}"/>
      <ellipse cx="0" cy="28" rx="5.5" ry="2.4" fill="${G.shoe}"/>
    </g>

    <g class="cc-bob">
      <!-- shirt body, slightly oversized like the photo -->
      <path d="M -20 46 Q -22 62 -18 82 L 18 82 Q 22 62 20 46 Q 18 36 0 34 Q -18 36 -20 46 Z"
            fill="${G.top}" stroke="${G.topShadow || 'rgba(0,0,0,0.06)'}" stroke-width="0.7"/>
      <!-- shirt collar V -->
      <path d="M -5 34 L 0 42 L 5 34" fill="none" stroke="${G.topShadow || 'rgba(0,0,0,0.10)'}" stroke-width="0.6"/>
      <!-- vest/tie/bow if formal -->
      ${G.vest ? `
        <path d="M -12 40 Q -12 60 -8 80 L 8 80 Q 12 60 12 40 L 5 36 L 0 42 L -5 36 Z" fill="${G.vest}"/>
        <line x1="0" y1="44" x2="0" y2="78" stroke="${G.vestBtn || '#000'}" stroke-width="0.5" opacity="0.6"/>
        <circle cx="0" cy="50" r="0.7" fill="${G.vestBtn || '#000'}"/>
        <circle cx="0" cy="58" r="0.7" fill="${G.vestBtn || '#000'}"/>
        <circle cx="0" cy="66" r="0.7" fill="${G.vestBtn || '#000'}"/>
      ` : ''}
      ${G.bowtie ? `
        <path d="M -5 38 L -1 36 L -1 42 L -5 40 Z" fill="${G.bowtie}"/>
        <path d="M 5 38 L 1 36 L 1 42 L 5 40 Z" fill="${G.bowtie}"/>
        <rect x="-1" y="37" width="2" height="4" fill="${G.bowtie}"/>
      ` : ''}
      <!-- LEFT arm (swings naturally) -->
      <g class="cc-arm-l" transform="translate(-18,46)">
        <path d="M -2 0 Q -6 14 -4 26 Q -2 28 0 26 Q 2 14 2 0 Z" fill="${G.top}"/>
        <circle cx="-2" cy="28" r="3" fill="${G.skin}"/>
      </g>
      <!-- RIGHT arm reaches across to bride (holding hands) -->
      <g class="cc-arm-r" transform="translate(18,46)">
        <path d="M 0 0 Q 8 18 18 26 Q 20 28 18 30 Q 6 26 -2 12 Z" fill="${G.top}"/>
        <circle cx="20" cy="29" r="3.2" fill="${G.skin}"/>
      </g>
      <!-- neck -->
      <path d="M -3 28 L 3 28 L 4 36 L -4 36 Z" fill="${G.skin}"/>
      <!-- ============ head ============ -->
      <g transform="translate(0,10)">
        <!-- hair back layer -->
        <path d="M -20 -2 Q -22 -18 -8 -22 L 8 -22 Q 22 -18 20 -2 Q 21 4 18 8 L -18 8 Q -21 4 -20 -2 Z" fill="${G.hair}"/>
        <!-- face -->
        <ellipse cx="0" cy="2" rx="18" ry="19" fill="${G.skin}" filter="url(#cc-soft)"/>
        <!-- ears -->
        <ellipse cx="-18" cy="3" rx="2.5" ry="3.5" fill="${G.skin}"/>
        <ellipse cx="18" cy="3" rx="2.5" ry="3.5" fill="${G.skin}"/>
        <!-- hair front (parted, swept) -->
        <path d="M -18 -6 Q -16 -20 -2 -20 L 6 -20 Q 18 -18 18 -8
                 Q 17 -10 12 -10 Q 8 -12 4 -10 Q 0 -8 -2 -10 Q -8 -12 -12 -10 Q -16 -8 -18 -6 Z"
              fill="${G.hair}"/>
        <!-- hair shine -->
        <path d="M -8 -16 Q -4 -18 0 -16" stroke="${G.hairLight || 'rgba(255,255,255,0.25)'}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <!-- eyebrows -->
        <path d="M -8 -4 Q -6 -5 -3 -4" stroke="${G.brow || '#2a1f18'}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M 3 -4 Q 6 -5 8 -4" stroke="${G.brow || '#2a1f18'}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <!-- eyes (anime-ish round) -->
        <ellipse cx="-6" cy="2" rx="2" ry="2.8" fill="#1A1612"/>
        <ellipse cx="6" cy="2" rx="2" ry="2.8" fill="#1A1612"/>
        <circle cx="-5.4" cy="0.8" r="0.9" fill="#fff"/>
        <circle cx="6.6" cy="0.8" r="0.9" fill="#fff"/>
        <circle cx="-6.2" cy="3.4" r="0.4" fill="#fff" opacity="0.6"/>
        <circle cx="5.8" cy="3.4" r="0.4" fill="#fff" opacity="0.6"/>
        <!-- nose hint -->
        <path d="M 0 5 Q -0.5 6.5 0 7" stroke="rgba(0,0,0,0.18)" stroke-width="0.6" fill="none" stroke-linecap="round"/>
        <!-- cheeks -->
        <ellipse cx="-9" cy="8" rx="3" ry="1.6" fill="url(#cc-cheek)"/>
        <ellipse cx="9" cy="8" rx="3" ry="1.6" fill="url(#cc-cheek)"/>
        <!-- smile -->
        <path d="M -3 11 Q 0 14 3 11" stroke="#1A1612" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      </g>
    </g>
  </g>

  <!-- ====================  BRIDE (right, ~x=130)  ==================== -->
  <g transform="translate(130,8)">
    <!-- legs barely visible under dress -->
    <g class="cc-leg-r" transform="translate(-6,90)">
      <path d="M -3 0 Q -3 8 -2 16 L 3 16 Q 3 8 3 0 Z" fill="${B.sockColor || B.skin}"/>
      <ellipse cx="0" cy="18" rx="4" ry="2" fill="${B.shoe}"/>
    </g>
    <g class="cc-leg-l" transform="translate(6,90)">
      <path d="M -3 0 Q -3 8 -2 16 L 3 16 Q 3 8 3 0 Z" fill="${B.sockColor || B.skin}"/>
      <ellipse cx="0" cy="18" rx="4" ry="2" fill="${B.shoe}"/>
    </g>

    <g class="cc-bob">
      <!-- A-line dress flares wide -->
      <path d="M -14 44 Q -16 56 -22 92 L 22 92 Q 16 56 14 44 Q 12 36 0 34 Q -12 36 -14 44 Z"
            fill="${B.dress}" stroke="${B.dressShadow || 'rgba(0,0,0,0.05)'}" stroke-width="0.7"/>
      <!-- subtle dress hem highlight -->
      <path d="M -22 92 Q 0 88 22 92" stroke="${B.dressDetail || 'rgba(255,255,255,0.5)'}" stroke-width="0.7" fill="none"/>
      <!-- waist sash -->
      ${B.sash ? `<path d="M -15 52 Q 0 56 15 52 L 16 56 Q 0 60 -16 56 Z" fill="${B.sash}" opacity="0.85"/>` : ''}
      <!-- straps -->
      <path d="M -7 34 Q -8 38 -10 44" stroke="${B.dressShadow || 'rgba(0,0,0,0.10)'}" stroke-width="1.2" fill="none"/>
      <path d="M 7 34 Q 8 38 10 44" stroke="${B.dressShadow || 'rgba(0,0,0,0.10)'}" stroke-width="1.2" fill="none"/>

      <!-- LEFT arm reaches toward groom (holds hand) -->
      <g class="cc-arm-l" transform="translate(-12,46)">
        <path d="M 0 0 Q -8 14 -16 22 Q -18 24 -16 26 Q -6 22 2 10 Z" fill="${B.skin}"/>
        <circle cx="-18" cy="25" r="3" fill="${B.skin}"/>
      </g>
      <!-- RIGHT arm holds bouquet -->
      <g class="cc-arm-r" transform="translate(12,46)">
        <path d="M 0 0 Q 4 14 2 26 Q 0 28 -2 26 Q -4 14 -2 0 Z" fill="${B.skin}"/>
        <circle cx="0" cy="27" r="2.8" fill="${B.skin}"/>
        <!-- bouquet bigger, multi-bloom -->
        <g transform="translate(0,30)">
          <!-- stems -->
          <path d="M 0 0 Q 2 8 1 14" stroke="${B.bouquetStem || '#5d7a3a'}" stroke-width="1.2" fill="none"/>
          <path d="M -1 0 Q -2 7 -3 14" stroke="${B.bouquetStem || '#5d7a3a'}" stroke-width="1" fill="none"/>
          <!-- leaves -->
          <ellipse cx="-3" cy="6" rx="2.5" ry="1.2" fill="${B.bouquetLeaf || '#7C9558'}" transform="rotate(-30 -3 6)"/>
          <ellipse cx="4" cy="7" rx="2.5" ry="1.2" fill="${B.bouquetLeaf || '#7C9558'}" transform="rotate(30 4 7)"/>
          <!-- flowers cluster -->
          <circle cx="-3" cy="-2" r="3.2" fill="${B.bouquet}"/>
          <circle cx="3" cy="-1" r="3.5" fill="${B.bouquet}"/>
          <circle cx="0" cy="-5" r="3.2" fill="${B.bouquet}"/>
          <circle cx="-1" cy="1" r="3" fill="${B.bouquet}"/>
          <circle cx="4" cy="-5" r="2.6" fill="${B.bouquet}"/>
          ${B.bouquetCenter ? `
            <circle cx="-3" cy="-2" r="1.1" fill="${B.bouquetCenter}"/>
            <circle cx="3" cy="-1" r="1.3" fill="${B.bouquetCenter}"/>
            <circle cx="0" cy="-5" r="1.1" fill="${B.bouquetCenter}"/>
            <circle cx="-1" cy="1" r="1" fill="${B.bouquetCenter}"/>
            <circle cx="4" cy="-5" r="0.9" fill="${B.bouquetCenter}"/>
          ` : ''}
          ${B.bouquetPetal ? `
            <!-- petal hints around each flower -->
            <circle cx="-3" cy="-2" r="2.2" fill="none" stroke="${B.bouquetPetal}" stroke-width="0.4" opacity="0.5"/>
            <circle cx="3" cy="-1" r="2.4" fill="none" stroke="${B.bouquetPetal}" stroke-width="0.4" opacity="0.5"/>
          ` : ''}
        </g>
      </g>

      <!-- neck -->
      <path d="M -2.5 30 L 2.5 30 L 3 36 L -3 36 Z" fill="${B.skin}"/>

      <!-- ============ head ============ -->
      <g transform="translate(0,10)">
        <!-- back hair shape (long down to neck/shoulder) -->
        <path d="M -18 4 Q -22 -4 -18 -14 Q -10 -22 0 -22 Q 10 -22 18 -14 Q 22 -4 18 4 Q 22 16 16 26 L -16 26 Q -22 16 -18 4 Z" fill="${B.hair}"/>
        <!-- face -->
        <ellipse cx="0" cy="2" rx="16" ry="17" fill="${B.skin}" filter="url(#cc-soft)"/>
        <!-- ears -->
        <ellipse cx="-16" cy="3" rx="2" ry="3" fill="${B.skin}"/>
        <ellipse cx="16" cy="3" rx="2" ry="3" fill="${B.skin}"/>
        <!-- bangs (full fringe) -->
        <path d="M -15 -6 Q -14 -18 0 -19 Q 14 -18 15 -6
                 Q 12 -3 9 -4 Q 4 -2 0 -3 Q -4 -2 -9 -4 Q -12 -3 -15 -6 Z" fill="${B.hair}"/>
        <!-- side hair down past chin -->
        <path d="M -15 -2 Q -19 14 -13 24" stroke="${B.hair}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M 15 -2 Q 19 14 13 24" stroke="${B.hair}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <!-- hair shine -->
        <path d="M -8 -14 Q 0 -17 8 -14" stroke="${B.hairLight || 'rgba(255,255,255,0.30)'}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <!-- eyebrows -->
        <path d="M -8 -3 Q -6 -4 -4 -3" stroke="${B.brow || '#1A1612'}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <path d="M 4 -3 Q 6 -4 8 -3" stroke="${B.brow || '#1A1612'}" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <!-- eyes (large round, with lashes hint) -->
        <ellipse cx="-6" cy="3" rx="2.4" ry="3.2" fill="#1A1612"/>
        <ellipse cx="6" cy="3" rx="2.4" ry="3.2" fill="#1A1612"/>
        <circle cx="-5.2" cy="1.6" r="1" fill="#fff"/>
        <circle cx="6.8" cy="1.6" r="1" fill="#fff"/>
        <circle cx="-6.4" cy="4.4" r="0.5" fill="#fff" opacity="0.6"/>
        <circle cx="5.6" cy="4.4" r="0.5" fill="#fff" opacity="0.6"/>
        <!-- eyelash hint -->
        <path d="M -8 1 L -7.5 0" stroke="#1A1612" stroke-width="0.5" stroke-linecap="round"/>
        <path d="M 8 1 L 7.5 0" stroke="#1A1612" stroke-width="0.5" stroke-linecap="round"/>
        <!-- nose hint -->
        <path d="M 0 6 Q -0.5 7.5 0 8" stroke="rgba(0,0,0,0.2)" stroke-width="0.6" fill="none" stroke-linecap="round"/>
        <!-- cheeks -->
        <ellipse cx="-8" cy="9" rx="3" ry="1.8" fill="url(#cc-cheek)"/>
        <ellipse cx="8" cy="9" rx="3" ry="1.8" fill="url(#cc-cheek)"/>
        <!-- smile -->
        <path d="M -2.5 11 Q 0 13.5 2.5 11" stroke="#1A1612" stroke-width="1" fill="none" stroke-linecap="round"/>
        <!-- lip highlight -->
        <ellipse cx="0" cy="11.5" rx="2.5" ry="0.4" fill="#E54B4B" opacity="0.3"/>
      </g>
    </g>
  </g>

  <!-- holding hands link (drawn between arms tips ≈ x=92→x=112, y=89) -->
  <ellipse cx="100" cy="89" rx="6" ry="3" fill="${G.skin}" opacity="0.95"/>
  <path d="M 94 87 Q 100 91 106 87" stroke="rgba(0,0,0,0.12)" stroke-width="0.5" fill="none"/>
</svg>`;
  }

  /* Photo paper-doll: face crops from real photos, with drawn paper bodies
     beneath. Hinged at hips. ViewBox 200x130. Heads centered at x=70/130, y=28. */
  function photoSVG(opts) {
    const base = opts.base || 'assets/photos';
    // peekaboo has both faces close together and at the right height for circular crops
    const groomImg = opts.groomImg || 'day-peekaboo.jpg';
    const brideImg = opts.brideImg || 'day-peekaboo.jpg';
    return `
<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" aria-label="photo paperdoll couple">
  <defs>
    <clipPath id="cc-pclip-g"><circle cx="70" cy="28" r="22"/></clipPath>
    <clipPath id="cc-pclip-b"><circle cx="130" cy="28" r="22"/></clipPath>
    <filter id="cc-paper" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="0.2"/>
    </filter>
  </defs>

  <!-- ============ GROOM ============ -->
  <g class="cc-bob">
    <!-- legs -->
    <g class="cc-leg-l" transform="translate(63,82)">
      <rect x="-3.5" y="0" width="7" height="26" rx="3" fill="#5B6C82"/>
      <ellipse cx="0" cy="28" rx="5" ry="2.4" fill="#FAFAFA"/>
    </g>
    <g class="cc-leg-r" transform="translate(77,82)">
      <rect x="-3.5" y="0" width="7" height="26" rx="3" fill="#5B6C82"/>
      <ellipse cx="0" cy="28" rx="5" ry="2.4" fill="#FAFAFA"/>
    </g>
    <!-- shirt body (white, oversized) -->
    <path d="M 50 50 Q 48 60 50 82 L 90 82 Q 92 60 90 50 Q 88 42 70 40 Q 52 42 50 50 Z"
          fill="#FAFAFA" stroke="rgba(0,0,0,0.08)" stroke-width="0.7"/>
    <path d="M 65 40 L 70 48 L 75 40" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.6"/>
    <!-- LEFT arm -->
    <g class="cc-arm-l" transform="translate(50,50)">
      <path d="M -2 0 Q -6 14 -4 26 Q -2 28 0 26 Q 2 14 2 0 Z" fill="#FAFAFA"/>
      <circle cx="-2" cy="28" r="3" fill="#F4D4B8"/>
    </g>
    <!-- RIGHT arm reaches across -->
    <g class="cc-arm-r" transform="translate(90,50)">
      <path d="M 0 0 Q 8 18 18 24 Q 20 26 18 28 Q 6 24 -2 12 Z" fill="#FAFAFA"/>
      <circle cx="20" cy="27" r="3" fill="#F4D4B8"/>
    </g>
    <!-- face circle photo — anchor LEFT-TOP to show groom (who's on left side of couple shots) -->
    <image href="${base}/${groomImg}" x="38" y="2" width="64" height="64"
           preserveAspectRatio="xMinYMin slice" clip-path="url(#cc-pclip-g)"
           filter="url(#cc-paper)"/>
    <!-- paper border -->
    <circle cx="70" cy="28" r="22" fill="none" stroke="#fff" stroke-width="1.5"/>
    <circle cx="70" cy="28" r="22.5" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.7"/>
  </g>

  <!-- ============ BRIDE ============ -->
  <g class="cc-bob" style="animation-delay:0.08s">
    <!-- short legs under dress -->
    <g class="cc-leg-r" transform="translate(124,98)">
      <rect x="-3" y="0" width="6" height="10" rx="2" fill="#FAFAFA"/>
      <ellipse cx="0" cy="11" rx="4" ry="2" fill="#FAFAFA"/>
    </g>
    <g class="cc-leg-l" transform="translate(136,98)">
      <rect x="-3" y="0" width="6" height="10" rx="2" fill="#FAFAFA"/>
      <ellipse cx="0" cy="11" rx="4" ry="2" fill="#FAFAFA"/>
    </g>
    <!-- A-line white dress -->
    <path d="M 116 52 Q 114 62 108 100 L 152 100 Q 146 62 144 52 Q 142 42 130 40 Q 118 42 116 52 Z"
          fill="#FFFFFF" stroke="rgba(0,0,0,0.06)" stroke-width="0.7"/>
    <path d="M 108 100 Q 130 96 152 100" stroke="rgba(255,255,255,0.6)" stroke-width="0.7" fill="none"/>
    <!-- straps -->
    <path d="M 123 40 Q 122 44 120 52" stroke="rgba(0,0,0,0.1)" stroke-width="1.2" fill="none"/>
    <path d="M 137 40 Q 138 44 140 52" stroke="rgba(0,0,0,0.1)" stroke-width="1.2" fill="none"/>
    <!-- LEFT arm toward groom -->
    <g class="cc-arm-l" transform="translate(118,52)">
      <path d="M 0 0 Q -8 14 -16 22 Q -18 24 -16 26 Q -6 22 2 10 Z" fill="#F4D4B8"/>
      <circle cx="-18" cy="25" r="3" fill="#F4D4B8"/>
    </g>
    <!-- RIGHT arm + bouquet -->
    <g class="cc-arm-r" transform="translate(142,52)">
      <path d="M 0 0 Q 4 14 2 26 Q 0 28 -2 26 Q -4 14 -2 0 Z" fill="#F4D4B8"/>
      <circle cx="0" cy="27" r="2.8" fill="#F4D4B8"/>
      <g transform="translate(0,30)">
        <ellipse cx="-3" cy="6" rx="2.5" ry="1.2" fill="#7C9558" transform="rotate(-30 -3 6)"/>
        <ellipse cx="4" cy="7" rx="2.5" ry="1.2" fill="#7C9558" transform="rotate(30 4 7)"/>
        <circle cx="-3" cy="-2" r="3" fill="#F8F4EA"/>
        <circle cx="3" cy="-1" r="3.2" fill="#F8F4EA"/>
        <circle cx="0" cy="-5" r="3" fill="#F8F4EA"/>
        <circle cx="-1" cy="1" r="2.6" fill="#F8F4EA"/>
        <circle cx="-3" cy="-2" r="1" fill="#E8D9B8"/>
        <circle cx="3" cy="-1" r="1.1" fill="#E8D9B8"/>
        <circle cx="0" cy="-5" r="1" fill="#E8D9B8"/>
      </g>
    </g>
    <!-- face circle photo — anchor RIGHT-TOP to show bride (who's on right side of couple shots) -->
    <image href="${base}/${brideImg}" x="98" y="2" width="64" height="64"
           preserveAspectRatio="xMaxYMin slice" clip-path="url(#cc-pclip-b)"
           filter="url(#cc-paper)"/>
    <circle cx="130" cy="28" r="22" fill="none" stroke="#fff" stroke-width="1.5"/>
    <circle cx="130" cy="28" r="22.5" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.7"/>
  </g>

  <!-- holding hands link -->
  <ellipse cx="100" cy="78" rx="5" ry="2.6" fill="#F4D4B8"/>
</svg>`;
  }

  /* Pixel art — 32x32 chunky pixels, walking sprite. Two frames swapped via
     CSS animation on a wrapping group. */
  function pixelSVG() {
    // helper: pixel grid (each cell = 4 units in viewBox)
    const px = 4;
    function dot(x, y, c) { return `<rect x="${x*px}" y="${y*px}" width="${px}" height="${px}" fill="${c}"/>`; }

    // groom 16x16 sprite – frame A
    function groomFrame(legSwap) {
      const skin = '#F4D4B8', hair = '#2A1F18', shirt = '#FAFAFA', pants = '#5B6C82', shoe = '#3a3a3a';
      const r = [];
      // hair top row
      r.push(dot(5,1,hair), dot(6,1,hair), dot(7,1,hair), dot(8,1,hair), dot(9,1,hair), dot(10,1,hair));
      r.push(dot(4,2,hair), dot(5,2,hair), dot(6,2,hair), dot(7,2,hair), dot(8,2,hair), dot(9,2,hair), dot(10,2,hair), dot(11,2,hair));
      // face
      r.push(dot(4,3,skin), dot(5,3,skin), dot(6,3,skin), dot(7,3,skin), dot(8,3,skin), dot(9,3,skin), dot(10,3,skin), dot(11,3,skin));
      r.push(dot(4,4,skin), dot(5,4,'#1A1612'), dot(6,4,skin), dot(7,4,skin), dot(8,4,skin), dot(9,4,'#1A1612'), dot(10,4,skin), dot(11,4,skin));
      r.push(dot(4,5,skin), dot(5,5,skin), dot(6,5,skin), dot(7,5,'#E5A89A'), dot(8,5,'#E5A89A'), dot(9,5,skin), dot(10,5,skin), dot(11,5,skin));
      r.push(dot(5,6,skin), dot(6,6,'#1A1612'), dot(7,6,'#1A1612'), dot(8,6,'#1A1612'), dot(9,6,'#1A1612'), dot(10,6,skin));
      // shirt
      for (let x=4; x<=11; x++) r.push(dot(x,7,shirt));
      for (let x=3; x<=12; x++) r.push(dot(x,8,shirt));
      for (let x=3; x<=12; x++) r.push(dot(x,9,shirt));
      for (let x=4; x<=11; x++) r.push(dot(x,10,shirt));
      // pants
      for (let x=4; x<=11; x++) r.push(dot(x,11,pants));
      for (let x=4; x<=11; x++) r.push(dot(x,12,pants));
      // legs (split)
      if (legSwap) {
        r.push(dot(5,13,pants), dot(6,13,pants), dot(10,13,pants), dot(9,13,pants));
        r.push(dot(5,14,pants), dot(10,14,pants));
        r.push(dot(4,15,shoe), dot(5,15,shoe), dot(10,15,shoe), dot(11,15,shoe));
      } else {
        r.push(dot(5,13,pants), dot(6,13,pants), dot(10,13,pants), dot(9,13,pants));
        r.push(dot(6,14,pants), dot(9,14,pants));
        r.push(dot(5,15,shoe), dot(6,15,shoe), dot(9,15,shoe), dot(10,15,shoe));
      }
      return r.join('');
    }

    // bride 16x16 sprite (dress flares wider)
    function brideFrame(legSwap) {
      const skin = '#F4D4B8', hair = '#1A1612', dress = '#FFFFFF', shoe = '#FFFFFF', sock = '#FFFFFF';
      const r = [];
      // long hair behind
      for (let y=2; y<=8; y++) { r.push(dot(3,y,hair), dot(12,y,hair)); }
      // hair top
      r.push(dot(5,1,hair), dot(6,1,hair), dot(7,1,hair), dot(8,1,hair), dot(9,1,hair), dot(10,1,hair));
      r.push(dot(4,2,hair), dot(5,2,hair), dot(6,2,hair), dot(7,2,hair), dot(8,2,hair), dot(9,2,hair), dot(10,2,hair), dot(11,2,hair));
      // face
      for (let x=4; x<=11; x++) r.push(dot(x,3,skin));
      r.push(dot(4,4,hair), dot(5,4,hair), dot(6,4,skin), dot(7,4,skin), dot(8,4,skin), dot(9,4,skin), dot(10,4,hair), dot(11,4,hair));
      r.push(dot(4,5,skin), dot(5,5,'#1A1612'), dot(6,5,skin), dot(7,5,skin), dot(8,5,skin), dot(9,5,'#1A1612'), dot(10,5,skin), dot(11,5,skin));
      r.push(dot(5,6,skin), dot(6,6,'#E5A89A'), dot(7,6,'#E5A89A'), dot(8,6,'#E5A89A'), dot(9,6,'#E5A89A'), dot(10,6,skin));
      // dress top
      for (let x=4; x<=11; x++) r.push(dot(x,7,dress));
      // dress flare
      for (let x=3; x<=12; x++) r.push(dot(x,8,dress));
      for (let x=2; x<=13; x++) r.push(dot(x,9,dress));
      for (let x=2; x<=13; x++) r.push(dot(x,10,dress));
      for (let x=2; x<=13; x++) r.push(dot(x,11,dress));
      // socks
      r.push(dot(6,12,sock), dot(7,12,sock), dot(8,12,sock), dot(9,12,sock));
      if (legSwap) {
        r.push(dot(6,13,sock), dot(7,13,sock), dot(8,13,sock), dot(9,13,sock));
        r.push(dot(5,14,sock), dot(10,14,sock));
        r.push(dot(5,15,shoe), dot(10,15,shoe));
      } else {
        r.push(dot(6,13,sock), dot(7,13,sock), dot(8,13,sock), dot(9,13,sock));
        r.push(dot(7,14,sock), dot(8,14,sock));
        r.push(dot(6,15,shoe), dot(9,15,shoe));
      }
      // bouquet (yellow flowers - tribute to sunflower photo)
      r.push(dot(11,8,'#F4C24A'), dot(12,8,'#F4C24A'));
      r.push(dot(11,9,'#F4C24A'), dot(12,9,'#5d7a3a'));
      return r.join('');
    }

    return `
<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-label="pixel couple">
  <style>
    @keyframes cc-pix { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
    @keyframes cc-pix2{ 0%, 49% { opacity: 0 } 50%, 100% { opacity: 1 } }
    .cc-pix-a { animation: cc-pix 0.5s steps(1,end) infinite; }
    .cc-pix-b { animation: cc-pix2 0.5s steps(1,end) infinite; }
  </style>

  <!-- groom sprite (left), 64x64 area at viewBox 200x130 -->
  <g transform="translate(36,58)">
    <g class="cc-pix-a">${groomFrame(false)}</g>
    <g class="cc-pix-b">${groomFrame(true)}</g>
  </g>

  <!-- bride sprite (right) -->
  <g transform="translate(116,58)">
    <g class="cc-pix-a">${brideFrame(false)}</g>
    <g class="cc-pix-b">${brideFrame(true)}</g>
  </g>

  <!-- pixel hearts holding line -->
  <g transform="translate(96,98)">
    <rect x="0" y="0" width="4" height="4" fill="#E54B4B"/>
    <rect x="4" y="0" width="4" height="4" fill="#E54B4B"/>
  </g>
</svg>`;
  }

  /* ── Style registry ──────────────────────────────────────────────────── */
  const STYLES = {
    'chibi-white': () => chibiSVG(
      // GROOM: white oversized shirt, blue jeans, white sneakers, black hair
      {
        skin: '#F4D4B8', hair: '#1F1A14',
        hairLight: 'rgba(255,255,255,0.18)',
        top: '#FAFAFA', topShadow: 'rgba(0,0,0,0.10)',
        pants: '#5B6C82', shoe: '#FFFFFF',
        brow: '#2a1f18',
      },
      // BRIDE: white flowy mini dress, white knee socks, white sneakers, bouquet of white flowers
      {
        skin: '#F4D4B8', hair: '#1A1612',
        hairLight: 'rgba(255,255,255,0.22)',
        dress: '#FFFFFF', dressShadow: 'rgba(0,0,0,0.06)',
        dressDetail: 'rgba(255,255,255,0.7)',
        sockColor: '#FAFAFA', shoe: '#FFFFFF',
        bouquet: '#F8F4EA', bouquetCenter: '#E8D9B8',
        bouquetStem: '#7C9558', bouquetLeaf: '#7C9558',
        bouquetPetal: '#D4C4A0',
        brow: '#1A1612',
      },
      '윤기훈 한솔이 — 낮 컨셉 (화이트)'
    ),

    'chibi-black': () => chibiSVG(
      // GROOM: black tux/vest, white shirt, black bow tie, slicked hair
      {
        skin: '#F4D4B8', hair: '#0A0A0A',
        hairLight: 'rgba(255,255,255,0.10)',
        top: '#FFFFFF', topShadow: 'rgba(0,0,0,0.15)',
        vest: '#1A1A1A', vestBtn: 'rgba(255,255,255,0.3)',
        bowtie: '#1A1A1A',
        pants: '#1A1A1A', shoe: '#0F0F0F',
        brow: '#0A0A0A',
      },
      // BRIDE: black gown, sunflower bouquet
      {
        skin: '#F4D4B8', hair: '#0A0A0A',
        hairLight: 'rgba(255,255,255,0.12)',
        dress: '#1A1A1A', dressShadow: 'rgba(0,0,0,0.5)',
        dressDetail: 'rgba(255,255,255,0.08)',
        sockColor: '#F4D4B8', shoe: '#0F0F0F',
        sash: '#0A0A0A',
        bouquet: '#F4C24A', bouquetCenter: '#5B3A0F',
        bouquetStem: '#3a5a2a', bouquetLeaf: '#4a6b3a',
        bouquetPetal: '#E5AC2A',
        brow: '#0A0A0A',
      },
      '윤기훈 한솔이 — 저녁 컨셉 (블랙 + 해바라기)'
    ),

    'pixel': () => pixelSVG(),

    'photo': (opts) => photoSVG(opts || {}),
  };

  /* ── Public API ──────────────────────────────────────────────────────── */
  function injectCSS(scope) {
    if (document.getElementById('cc-styles')) return;
    const s = document.createElement('style');
    s.id = 'cc-styles';
    s.textContent = LAYER_CSS;
    (scope || document.head).appendChild(s);
  }

  function makeCouple(style, opts) {
    const wrap = document.createElement('div');
    wrap.className = 'cc-couple' + (style === 'pixel' ? ' cc-pixel' : '');
    wrap.dataset.style = style;
    wrap.innerHTML = STYLES[style](opts) + '<div class="cc-shadow"></div>';
    return wrap;
  }

  function init(options) {
    options = options || {};
    const style = options.style || 'chibi-white';
    const mode = options.mode || 'walk';      // walk | idle
    const speed = options.speed || 0.35;       // px per frame
    const zone = options.zone || document.body;
    const photoBase = options.photoBase || 'assets/photos';

    injectCSS();

    let layer = document.querySelector('.cc-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'cc-layer';
      layer.innerHTML = '<div class="cc-stage"></div>';
      zone.appendChild(layer);
    }
    const stage = layer.querySelector('.cc-stage');
    stage.innerHTML = '';

    const couple = makeCouple(style, { base: photoBase });
    if (mode === 'idle') couple.classList.add('cc-idle');
    stage.appendChild(couple);

    // walk back & forth
    let x = 20, dir = 1, paused = false;
    const w = () => (window.innerWidth - 220);
    function step() {
      if (!paused && mode === 'walk') {
        x += dir * speed;
        if (x > w()) { dir = -1; couple.classList.add('cc-flip'); }
        if (x < 10)  { dir = 1; couple.classList.remove('cc-flip'); }
        couple.style.setProperty('--cc-x', x + 'px');
        couple.style.transform = (dir < 0) ? `translateX(${x}px) scaleX(-1)` : `translateX(${x}px)`;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    // tap → hearts + brief pause
    couple.addEventListener('click', (e) => {
      const rect = couple.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      paused = true;
      couple.classList.add('cc-idle');
      for (let i=0; i<4; i++) {
        const h = document.createElement('div');
        h.className = 'cc-heart';
        h.textContent = '♥';
        h.style.left = (cx + (Math.random()*30 - 15)) + 'px';
        h.style.bottom = '90px';
        h.style.setProperty('--dx', ((Math.random()*40 - 20)) + 'px');
        h.style.animationDelay = (i * 0.08) + 's';
        couple.appendChild(h);
        setTimeout(() => h.remove(), 1300);
      }
      setTimeout(() => {
        paused = false;
        if (mode === 'walk') couple.classList.remove('cc-idle');
      }, 1500);
    });

    return {
      element: couple,
      setStyle(newStyle) {
        const updated = makeCouple(newStyle, { base: photoBase });
        if (couple.classList.contains('cc-flip')) updated.classList.add('cc-flip');
        couple.parentNode.replaceChild(updated, couple);
        return init({ ...options, style: newStyle });
      },
      pause() { paused = true; couple.classList.add('cc-idle'); },
      resume() { paused = false; if (mode === 'walk') couple.classList.remove('cc-idle'); },
    };
  }

  /* Style switcher chip — useful for showcase pages */
  function mountSwitcher(opts) {
    opts = opts || {};
    const current = opts.style || 'chibi-white';
    const styles = ['chibi-white', 'chibi-black', 'pixel', 'photo'];
    const labels = { 'chibi-white': '낮', 'chibi-black': '저녁', 'pixel': '8-bit', 'photo': '사진' };

    const bar = document.createElement('div');
    bar.className = 'cc-switcher';
    let api = null;

    styles.forEach((s) => {
      const b = document.createElement('button');
      b.textContent = labels[s];
      b.dataset.style = s;
      if (s === current) b.classList.add('cc-active');
      b.addEventListener('click', () => {
        bar.querySelectorAll('button').forEach(x => x.classList.remove('cc-active'));
        b.classList.add('cc-active');
        const layer = document.querySelector('.cc-layer');
        if (layer) layer.remove();
        api = init({ ...opts, style: s });
      });
      bar.appendChild(b);
    });
    document.body.appendChild(bar);
    api = init({ ...opts, style: current });
    return api;
  }

  /* Static SVG (no walking) for preview cells, also useful for game scenes */
  function renderSVG(style, opts) {
    if (!STYLES[style]) return '';
    return STYLES[style](opts || {});
  }

  global.CoupleCharacter = { init, mountSwitcher, renderSVG, styles: Object.keys(STYLES) };
})(window);
