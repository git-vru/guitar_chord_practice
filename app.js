// ============================================================
//  CHORD DATA
//  open/mute arrays: index 0 = string 1 (high e), index 5 = string 6 (low E)
//  dots: string 1 = high e, string 6 = low E
//  finger: 1=index, 2=middle, 3=ring, 4=pinky
// ============================================================
const CHORDS = {
  G: {
    label: 'G',
    // G major: low E fret 3, A fret 2, D open, G open, B fret 3, high e fret 3
    open: [false, false, true, true, false, false], // D(idx3) and G(idx2) are open
    mute: [false, false, false, false, false, false],
    frets: 3,
    dots: [
      { string: 6, fret: 3, finger: 2 }, // low E, fret 3, middle
      { string: 5, fret: 2, finger: 1 }, // A,     fret 2, index
      { string: 2, fret: 3, finger: 3 }, // B,     fret 3, ring
      { string: 1, fret: 3, finger: 4 }, // high e, fret 3, pinky
    ],
    legend: [
      { finger: 1, note: 'Index – A string, fret 2' },
      { finger: 2, note: 'Middle – Low E, fret 3' },
      { finger: 3, note: 'Ring – B string, fret 3' },
      { finger: 4, note: 'Pinky – High e, fret 3' },
    ]
  },
  D: {
    label: 'D',
    // D major: low E muted, A muted, D open, G fret 2, B fret 3, high e fret 2
    open: [false, false, false, true, false, false],  // D(idx3) open
    mute: [false, false, false, false, true,  true],  // A(idx4), low E(idx5) muted
    frets: 3,
    dots: [
      { string: 3, fret: 2, finger: 1 }, // G,     fret 2, index
      { string: 1, fret: 2, finger: 2 }, // high e, fret 2, middle
      { string: 2, fret: 3, finger: 3 }, // B,     fret 3, ring
    ],
    legend: [
      { finger: 1, note: 'Index – G string, fret 2' },
      { finger: 2, note: 'Middle – High e, fret 2' },
      { finger: 3, note: 'Ring – B string, fret 3' },
    ]
  },
  Em: {
    label: 'Em',
    // E minor: all open except A fret 2 and D fret 2
    open: [true, true, true, false, false, true],  // high e, B, G, low E open
    mute: [false, false, false, false, false, false],
    frets: 3,
    dots: [
      { string: 5, fret: 2, finger: 2 }, // A, fret 2, middle
      { string: 4, fret: 2, finger: 3 }, // D, fret 2, ring
    ],
    legend: [
      { finger: 2, note: 'Middle – A string, fret 2' },
      { finger: 3, note: 'Ring – D string, fret 2' },
    ]
  },
  C: {
    label: 'C',
    // C major: low E muted, A fret 3, D fret 2, G open, B fret 1, high e open
    open: [true, false, true, false, false, false],  // high e(idx0) and G(idx2) open
    mute: [false, false, false, false, false, true],  // low E(idx5) muted
    frets: 3,
    dots: [
      { string: 2, fret: 1, finger: 1 }, // B, fret 1, index
      { string: 4, fret: 2, finger: 2 }, // D, fret 2, middle
      { string: 5, fret: 3, finger: 3 }, // A, fret 3, ring
    ],
    legend: [
      { finger: 1, note: 'Index – B string, fret 1' },
      { finger: 2, note: 'Middle – D string, fret 2' },
      { finger: 3, note: 'Ring – A string, fret 3' },
    ]
  }
};

const CHORD_KEYS = Object.keys(CHORDS);

const FINGER_COLORS = {
  1: '#a78bfa', // index  – purple
  2: '#38bdf8', // middle – sky
  3: '#fb7185', // ring   – rose
  4: '#34d399', // pinky  – emerald
};
const FINGER_NAMES  = { 1: '1', 2: '2', 3: '3', 4: '4' };
const FINGER_LABELS = { 1: 'Index', 2: 'Middle', 3: 'Ring', 4: 'Pinky' };
const STRING_NAMES  = { 1: 'high e', 2: 'B', 3: 'G', 4: 'D', 5: 'A', 6: 'Low E' };

// ============================================================
//  CHORD DIAGRAM RENDERER (library cards)
// ============================================================
function drawChord(canvasId, chordKey) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx   = canvas.getContext('2d');
  const chord = CHORDS[chordKey];
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const STRINGS  = 6;
  const FRET_ROWS = chord.frets + 1;
  const PAD = { top: 44, bot: 14, left: 16, right: 16 };
  const aW = W - PAD.left - PAD.right;
  const aH = H - PAD.top  - PAD.bot;
  const sG = aW / (STRINGS - 1);
  const fG = aH / FRET_ROWS;
  const sX = i => PAD.left + i * sG;  // i: 0=low E, 5=high e
  const fY = f => PAD.top  + f * fG;  // f: 0=nut, 1=fret1 …

  // Nut
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillRect(PAD.left - 2, fY(0), aW + 4, 5);

  // Fret lines
  for (let f = 1; f <= FRET_ROWS; f++) {
    ctx.beginPath(); ctx.moveTo(PAD.left, fY(f)); ctx.lineTo(PAD.left + aW, fY(f));
    ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // String lines
  for (let s = 0; s < STRINGS; s++) {
    ctx.beginPath(); ctx.moveTo(sX(s), fY(0)); ctx.lineTo(sX(s), fY(FRET_ROWS));
    ctx.strokeStyle = 'rgba(255,255,255,0.20)'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // String name labels at bottom
  const strNames = ['E','A','D','G','B','e'];
  ctx.font = '9px Outfit,sans-serif'; ctx.textAlign = 'center';
  for (let s = 0; s < STRINGS; s++) {
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.fillText(strNames[s], sX(s), fY(FRET_ROWS) + 12);
  }

  // Open / Mute indicators
  // open/mute array: idx 0 = string1(high e), idx 5 = string6(low E)
  // canvas: s=0 → low E (left), s=5 → high e (right)
  // so chordIdx = 5 - s
  for (let s = 0; s < STRINGS; s++) {
    const ci = 5 - s;
    const cx = sX(s), cy = fY(0) - 18, r = 7;
    if (chord.mute[ci]) {
      ctx.strokeStyle = 'rgba(255,90,90,0.9)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx-r*.7, cy-r*.7); ctx.lineTo(cx+r*.7, cy+r*.7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+r*.7, cy-r*.7); ctx.lineTo(cx-r*.7, cy+r*.7); ctx.stroke();
    } else if (chord.open[ci]) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2; ctx.stroke();
    }
  }

  // Finger dots
  chord.dots.forEach(dot => {
    const si = 6 - dot.string; // string 1(high e)→5, string 6(low E)→0
    const cx = sX(si);
    const cy = fY(dot.fret - 1) + fG * 0.5;
    const r  = fG * 0.36;
    const col = FINGER_COLORS[dot.finger];

    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.6);
    grd.addColorStop(0, col + 'bb'); grd.addColorStop(1, col + '00');
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.6, 0, Math.PI*2); ctx.fillStyle = grd; ctx.fill();

    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = col; ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.round(r * 1.1)}px Outfit,sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(FINGER_NAMES[dot.finger], cx, cy);
    ctx.textBaseline = 'alphabetic';
  });
}

function buildLegend(legendId, chordKey) {
  const el = document.getElementById(legendId);
  if (!el) return;
  const chord = CHORDS[chordKey];
  el.innerHTML = chord.legend.map(l => `
    <div class="finger-badge">
      <div class="finger-dot" style="background:${FINGER_COLORS[l.finger]}">${l.finger}</div>
      <span style="color:${FINGER_COLORS[l.finger]}">${l.note}</span>
    </div>
  `).join('');
}

function initDiagrams() {
  CHORD_KEYS.forEach(k => { drawChord('canvas-'+k, k); buildLegend('legend-'+k, k); });
}

// ============================================================
//  TRANSITION ANIMATION — shows fingers moving from chord A → B
// ============================================================
const TC = { W: 340, H: 170, STRINGS: 6, FRETS: 4, TOP: 36, LEFT: 24, RIGHT: 24, BOT: 14 };

function getTCGeo() {
  const aW = TC.W - TC.LEFT - TC.RIGHT;
  const aH = TC.H - TC.TOP  - TC.BOT;
  const sG = aW / (TC.STRINGS - 1);
  const fG = aH / TC.FRETS;
  return { aW, aH, sG, fG, sX: i => TC.LEFT + i*sG, fY: f => TC.TOP + f*fG };
}

function dotPx(dot, geo) {
  return { cx: geo.sX(6 - dot.string), cy: geo.fY(dot.fret - 1) + geo.fG * 0.5 };
}

function drawTCBg(ctx, geo) {
  ctx.clearRect(0, 0, TC.W, TC.H);
  const { sX, fY, aW } = geo;

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(TC.LEFT - 2, fY(0), aW + 4, 4);

  for (let f = 1; f <= TC.FRETS; f++) {
    ctx.beginPath(); ctx.moveTo(TC.LEFT, fY(f)); ctx.lineTo(TC.LEFT + aW, fY(f));
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1; ctx.stroke();
  }
  for (let s = 0; s < TC.STRINGS; s++) {
    ctx.beginPath(); ctx.moveTo(sX(s), fY(0)); ctx.lineTo(sX(s), fY(TC.FRETS));
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1; ctx.stroke();
  }

  // Fret number labels on left
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.font = '9px Outfit,sans-serif'; ctx.textAlign = 'right';
  for (let f = 1; f <= TC.FRETS; f++) {
    ctx.fillText(f, TC.LEFT - 5, fY(f - 1) + geo.fG * 0.5 + 3);
  }

  const strNames = ['E','A','D','G','B','e'];
  ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.20)';
  for (let s = 0; s < TC.STRINGS; s++) ctx.fillText(strNames[s], sX(s), fY(TC.FRETS) + 12);
  ctx.textBaseline = 'alphabetic';
}

function drawTCDot(ctx, cx, cy, finger, alpha, r) {
  const col = FINGER_COLORS[finger];
  ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
  grd.addColorStop(0, col + '77'); grd.addColorStop(1, col + '00');
  ctx.beginPath(); ctx.arc(cx, cy, r * 2.2, 0, Math.PI*2); ctx.fillStyle = grd; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.round(r * 1.15)}px Outfit,sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(FINGER_NAMES[finger], cx, cy);
  ctx.textBaseline = 'alphabetic'; ctx.restore();
}

let _animId = null, _animStart = null;
const ANIM_DUR = 950;
function easeIO(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

function runTransitionAnim(fromKey, toKey) {
  if (_animId) { cancelAnimationFrame(_animId); _animId = null; }

  const section = document.getElementById('transitionSection');
  section.style.display = '';
  section.classList.remove('anim-in');
  void section.offsetWidth;
  section.classList.add('anim-in');

  document.getElementById('transitionChordDisplay').textContent =
    fromKey ? `${fromKey}  →  ${toKey}` : `▶ ${toKey}`;

  const canvas = document.getElementById('transitionCanvas');
  canvas.width = TC.W; canvas.height = TC.H;
  const ctx = canvas.getContext('2d');
  const geo = getTCGeo();
  const DOT_R = geo.fG * 0.30;

  const fromMap = {};
  if (fromKey) CHORDS[fromKey].dots.forEach(d => { fromMap[d.finger] = d; });
  const toMap = {};
  CHORDS[toKey].dots.forEach(d => { toMap[d.finger] = d; });

  const allF = new Set([...Object.keys(fromMap), ...Object.keys(toMap)].map(Number));

  _animStart = null;
  function frame(ts) {
    if (!_animStart) _animStart = ts;
    const raw = Math.min((ts - _animStart) / ANIM_DUR, 1);
    const t   = easeIO(raw);

    drawTCBg(ctx, geo);

    allF.forEach(f => {
      const hF = !!fromMap[f], hT = !!toMap[f];
      if (hF && hT) {
        const fp = dotPx(fromMap[f], geo), tp = dotPx(toMap[f], geo);
        const cx = fp.cx + (tp.cx - fp.cx) * t;
        const cy = fp.cy + (tp.cy - fp.cy) * t;

        // Dashed trail between start and current position
        if (fp.cx !== tp.cx || fp.cy !== tp.cy) {
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.beginPath(); ctx.moveTo(fp.cx, fp.cy); ctx.lineTo(tp.cx, tp.cy);
          ctx.strokeStyle = FINGER_COLORS[f];
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]); ctx.stroke();
          ctx.setLineDash([]); ctx.restore();

          // Arrow head at destination
          if (t > 0.5) {
            drawArrow(ctx, tp.cx, tp.cy, fp.cx, fp.cy, FINGER_COLORS[f], Math.min((t-0.5)*2, 1) * 0.5);
          }
        }
        drawTCDot(ctx, cx, cy, f, 1, DOT_R);

      } else if (hF) {
        // lift off – dot rises and fades
        const fp = dotPx(fromMap[f], geo);
        drawTCDot(ctx, fp.cx, fp.cy - t * 22, f, 1 - t, DOT_R);

      } else {
        // place – dot drops in from above
        const tp = dotPx(toMap[f], geo);
        drawTCDot(ctx, tp.cx, tp.cy - (1-t) * 26, f, t, DOT_R);
      }
    });

    if (raw < 1) { _animId = requestAnimationFrame(frame); }
    else         { _animId = null; }
  }
  _animId = requestAnimationFrame(frame);

  buildHints(fromMap, toMap);
}

function drawArrow(ctx, tx, ty, fx, fy, color, alpha) {
  const angle = Math.atan2(ty - fy, tx - fx);
  const hs = 8;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - hs * Math.cos(angle - 0.4), ty - hs * Math.sin(angle - 0.4));
  ctx.lineTo(tx - hs * Math.cos(angle + 0.4), ty - hs * Math.sin(angle + 0.4));
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function buildHints(fromMap, toMap) {
  const el = document.getElementById('fingerMoveHints');
  if (!el) return;
  const allF = new Set([...Object.keys(fromMap), ...Object.keys(toMap)].map(Number));
  const hints = [];

  allF.forEach(f => {
    const hF = !!fromMap[f], hT = !!toMap[f];
    const col = FINGER_COLORS[f], name = FINGER_LABELS[f];
    if (hF && hT) {
      const fd = fromMap[f], td = toMap[f];
      if (fd.string === td.string && fd.fret === td.fret) {
        hints.push({ col, icon: '📌', pri: 2, text: `${name} stays on ${STRING_NAMES[td.string]}, fret ${td.fret}` });
      } else {
        hints.push({ col, icon: '↗', pri: 1, text: `${name}: ${STRING_NAMES[fd.string]} fr${fd.fret} → ${STRING_NAMES[td.string]} fr${td.fret}` });
      }
    } else if (hF) {
      hints.push({ col, icon: '↑', pri: 3, text: `${name} lifts off` });
    } else {
      const td = toMap[f];
      hints.push({ col, icon: '↓', pri: 0, text: `${name} → ${STRING_NAMES[td.string]}, fret ${td.fret}` });
    }
  });

  hints.sort((a, b) => a.pri - b.pri);
  el.innerHTML = hints.map(h => `
    <div class="finger-hint" style="background:${h.col}15; border:1px solid ${h.col}40; color:${h.col}">
      <span class="hint-icon">${h.icon}</span>
      <span>${h.text}</span>
    </div>
  `).join('');
}

// ============================================================
//  TIMER
// ============================================================
const TOTAL_SECS = 15 * 60;
let timeLeft    = TOTAL_SECS;
let timerActive = false;
let _timerRef   = null;
let _switchRef  = null;
let switchInterval_ = 10;
let switchCount = 0;
let currentChord = null;
let prevChord    = null;

const CIRCUMFERENCE = 2 * Math.PI * 88;

function updateTimerDisplay(secs) {
  const m   = String(Math.floor(secs / 60)).padStart(2,'0');
  const s   = String(secs % 60).padStart(2,'0');
  const str = `${m}:${s}`;
  document.getElementById('timerDisplay').textContent = str;
  document.getElementById('statTime').textContent     = str;
  document.getElementById('ringProgress').style.strokeDashoffset =
    CIRCUMFERENCE * (1 - secs / TOTAL_SECS);
}

function startTimer() {
  if (timerActive) return;
  timerActive = true;
  document.getElementById('startBtn').disabled = true;
  document.getElementById('timerLabel').textContent = 'TRAINING';

  const svg = document.getElementById('timerSvg');
  if (!svg.querySelector('defs')) {
    svg.insertAdjacentHTML('afterbegin', `
      <defs>
        <linearGradient id="timerGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7c5cfc"/>
          <stop offset="100%" stop-color="#00d4ff"/>
        </linearGradient>
      </defs>`);
  }

  pickNextChord();
  schedSwitchInt();

  _timerRef = setInterval(() => {
    timeLeft--;
    updateTimerDisplay(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(_timerRef); clearInterval(_switchRef);
      timerActive = false;
      document.getElementById('timerLabel').textContent = 'DONE!';
      showOverlay();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(_timerRef); clearInterval(_switchRef);
  if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
  timerActive = false; timeLeft = TOTAL_SECS;
  switchCount = 0; currentChord = null; prevChord = null;

  updateTimerDisplay(TOTAL_SECS);
  document.getElementById('ringProgress').style.strokeDashoffset = 0;
  document.getElementById('timerLabel').textContent   = 'Ready';
  document.getElementById('startBtn').disabled        = false;
  document.getElementById('promptChord').textContent  = '—';
  document.getElementById('promptFrom').textContent   = '';
  document.getElementById('statSwitches').textContent = '0';
  document.getElementById('statCurrent').textContent  = '—';
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('transitionSection').style.display = 'none';
  CHORD_KEYS.forEach(k => document.getElementById('card-'+k).classList.remove('active-chord','target-chord'));
}

// ============================================================
//  CHORD SWITCHING
// ============================================================
function pickNextChord() {
  const candidates = CHORD_KEYS.filter(k => k !== currentChord);
  const next = candidates[Math.floor(Math.random() * candidates.length)];

  CHORD_KEYS.forEach(k => document.getElementById('card-'+k).classList.remove('active-chord','target-chord'));
  if (currentChord) document.getElementById('card-'+currentChord).classList.add('active-chord');
  document.getElementById('card-'+next).classList.add('target-chord');

  // Animate prompt
  const pe = document.getElementById('promptChord');
  pe.style.animation = 'none'; void pe.offsetWidth;
  pe.style.animation = 'chordPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both';
  pe.textContent = next;
  document.getElementById('promptFrom').textContent = currentChord ? `from ${currentChord}` : 'Start here!';

  // Run finger-movement animation
  runTransitionAnim(currentChord, next);

  prevChord    = currentChord;
  currentChord = next;
  switchCount++;
  document.getElementById('statSwitches').textContent = Math.max(0, switchCount - 1);
  document.getElementById('statCurrent').textContent  = next;
}

function schedSwitchInt() {
  clearInterval(_switchRef);
  _switchRef = setInterval(pickNextChord, switchInterval_ * 1000);
}

function setInterval_(btn, secs) {
  document.querySelectorAll('.interval-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  switchInterval_ = secs;
  if (timerActive) schedSwitchInt();
}

function selectChord(key) {
  CHORD_KEYS.forEach(k => document.getElementById('card-'+k).classList.remove('active-chord'));
  document.getElementById('card-'+key).classList.add('active-chord');
  currentChord = key;
  document.getElementById('statCurrent').textContent = key;
}

// ============================================================
//  OVERLAY
// ============================================================
function showOverlay() {
  document.getElementById('overlaySwitches').textContent = Math.max(0, switchCount - 1);
  document.getElementById('overlay').classList.add('show');
}

// ============================================================
//  INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  initDiagrams();
  updateTimerDisplay(TOTAL_SECS);
});
