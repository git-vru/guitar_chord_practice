// ============================================================
//  CHORD DATA — strings (1=high e, 6=low E), fret, finger
//  finger: 1=index, 2=middle, 3=ring, 4=pinky, 0=open, x=mute
// ============================================================
const CHORDS = {
  G: {
    label: 'G',
    open:  [true, true, false, false, false, false],  // strings 1-6 open status
    mute:  [false,false,false,false,false,false],
    frets:  3,   // how many fret rows to show (plus nut = 4)
    dots: [
      // { string: 1-6 (6=low E), fret: 1-based, finger: 1-4 }
      { string: 6, fret: 3, finger: 2 },
      { string: 5, fret: 2, finger: 1 },
      { string: 2, fret: 3, finger: 3 },
      { string: 1, fret: 3, finger: 4 },
    ],
    legend: [
      { finger: 1, note: 'Middle finger – A string, 2nd fret' },
      { finger: 2, note: 'Index finger – Low E, 3rd fret' },
      { finger: 3, note: 'Ring finger – B string, 3rd fret' },
      { finger: 4, note: 'Pinky – High e, 3rd fret' },
    ]
  },
  D: {
    label: 'D',
    open:  [false,false,false,true,false,false],
    mute:  [false,false,false,false,true,true],
    frets: 3,
    dots: [
      { string: 3, fret: 2, finger: 1 },
      { string: 1, fret: 2, finger: 2 },
      { string: 2, fret: 3, finger: 3 },
    ],
    legend: [
      { finger: 1, note: 'Index – G string, 2nd fret' },
      { finger: 2, note: 'Middle – High e, 2nd fret' },
      { finger: 3, note: 'Ring – B string, 3rd fret' },
    ]
  },
  Em: {
    label: 'Em',
    open:  [true, true, true, false, false, true],
    mute:  [false,false,false,false,false,false],
    frets: 3,
    dots: [
      { string: 5, fret: 2, finger: 2 },
      { string: 4, fret: 2, finger: 3 },
    ],
    legend: [
      { finger: 2, note: 'Middle – A string, 2nd fret' },
      { finger: 3, note: 'Ring – D string, 2nd fret' },
    ]
  },
  C: {
    label: 'C',
    open:  [true, false, false, false, false, false],
    mute:  [false,false,false,false,false,true],
    frets: 3,
    dots: [
      { string: 2, fret: 1, finger: 1 },
      { string: 4, fret: 2, finger: 2 },
      { string: 5, fret: 3, finger: 3 },
      { string: 3, fret: 2, finger: 4 },
    ],
    legend: [
      { finger: 1, note: 'Index – B string, 1st fret' },
      { finger: 2, note: 'Middle – D string, 2nd fret' },
      { finger: 3, note: 'Ring – A string, 3rd fret' },
      { finger: 4, note: 'Pinky – G string, 2nd fret' },
    ]
  }
};

const CHORD_KEYS = Object.keys(CHORDS);
const FINGER_COLORS = {
  1: '#7c5cfc',  // index  – purple
  2: '#00d4ff',  // middle – cyan
  3: '#ff6bcb',  // ring   – pink
  4: '#00e5a0',  // pinky  – green
};
const FINGER_NAMES = { 1:'1', 2:'2', 3:'3', 4:'4' };

// ============================================================
//  CHORD DIAGRAM RENDERER
// ============================================================
function drawChord(canvasId, chordKey) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const chord = CHORDS[chordKey];

  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0,0,W,H);

  // Layout geometry
  const STRINGS = 6;
  const FRET_ROWS = chord.frets + 1; // visible frets
  const TOP_PAD  = 44;   // room for open/mute/nut indicators
  const BOT_PAD  = 10;
  const LEFT_PAD = 14;
  const RIGHT_PAD= 14;

  const availW = W - LEFT_PAD - RIGHT_PAD;
  const availH = H - TOP_PAD - BOT_PAD;

  const strGap  = availW / (STRINGS - 1);
  const fretGap = availH / FRET_ROWS;

  const stringX = i => LEFT_PAD + i * strGap;           // i: 0=low E, 5=high e
  const fretY   = f => TOP_PAD + f * fretGap;           // f: 0=nut, 1=1st...

  // --- Nut ---
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillRect(LEFT_PAD - 2, fretY(0), availW + 4, 5);

  // --- Fret lines ---
  for (let f = 1; f <= FRET_ROWS; f++) {
    ctx.beginPath();
    ctx.moveTo(LEFT_PAD, fretY(f));
    ctx.lineTo(LEFT_PAD + availW, fretY(f));
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // --- String lines ---
  for (let s = 0; s < STRINGS; s++) {
    ctx.beginPath();
    ctx.moveTo(stringX(s), fretY(0));
    ctx.lineTo(stringX(s), fretY(FRET_ROWS));
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // --- String labels (low E…high e) at bottom ---
  const stringNames = ['E','A','D','G','B','e'];
  ctx.font = '9px Outfit, sans-serif';
  ctx.textAlign = 'center';
  for (let s = 0; s < STRINGS; s++) {
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.fillText(stringNames[s], stringX(s), fretY(FRET_ROWS) + 10);
  }

  // --- Open / Mute circles at top ---
  // chord.open: index 0=string1(high e), 5=string6(low E) → need to invert for canvas
  // canvas string index 0 = low E (left), 5 = high e (right)
  for (let s = 0; s < STRINGS; s++) {
    const chordIdx = 5 - s; // chord data index (0=high e, 5=low E)
    const cx = stringX(s);
    const cy = fretY(0) - 18;
    const r  = 7;
    if (chord.mute[chordIdx]) {
      // X mark
      ctx.strokeStyle = 'rgba(255,100,100,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx-r*0.7, cy-r*0.7); ctx.lineTo(cx+r*0.7, cy+r*0.7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+r*0.7, cy-r*0.7); ctx.lineTo(cx-r*0.7, cy+r*0.7); ctx.stroke();
    } else if (chord.open[chordIdx]) {
      // Open circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // --- Finger dots ---
  chord.dots.forEach(dot => {
    // dot.string: 1=high e, 6=low E → canvas index = 6 - dot.string
    const canvasStrIdx = 6 - dot.string;
    const cx = stringX(canvasStrIdx);
    const cy = fretY(dot.fret - 1) + fretGap * 0.5;
    const r  = fretGap * 0.36;

    // Glow
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.5);
    grd.addColorStop(0, FINGER_COLORS[dot.finger] + 'cc');
    grd.addColorStop(1, FINGER_COLORS[dot.finger] + '00');
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.5, 0, Math.PI*2);
    ctx.fillStyle = grd; ctx.fill();

    // Dot
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = FINGER_COLORS[dot.finger];
    ctx.fill();

    // Finger number
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.round(r * 1.1)}px Outfit, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
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

// Draw all chords on load
function initDiagrams() {
  CHORD_KEYS.forEach(k => {
    drawChord('canvas-' + k, k);
    buildLegend('legend-' + k, k);
  });
}

// ============================================================
//  TIMER
// ============================================================
const TOTAL_SECONDS = 15 * 60;
let timeLeft    = TOTAL_SECONDS;
let timerActive = false;
let timerRef    = null;
let switchInterval = 10;
let switchRef   = null;
let switchCount = 0;
let currentChord = null;
let prevChord    = null;

const CIRCUMFERENCE = 2 * Math.PI * 88; // r=88

function updateTimerDisplay(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2,'0');
  const s = String(secs % 60).padStart(2,'0');
  document.getElementById('timerDisplay').textContent = `${m}:${s}`;
  document.getElementById('statTime').textContent     = `${m}:${s}`;

  const ring = document.getElementById('ringProgress');
  const offset = CIRCUMFERENCE * (1 - secs / TOTAL_SECONDS);
  ring.style.strokeDashoffset = offset;
}

function startTimer() {
  if (timerActive) return;
  timerActive = true;
  document.getElementById('startBtn').disabled = true;
  document.getElementById('timerLabel').textContent = 'TRAINING';

  // Inject SVG gradient
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
  scheduleSwitchInterval();

  timerRef = setInterval(() => {
    timeLeft--;
    updateTimerDisplay(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerRef);
      clearInterval(switchRef);
      timerActive = false;
      document.getElementById('timerLabel').textContent = 'DONE!';
      showOverlay();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerRef);
  clearInterval(switchRef);
  timerActive  = false;
  timeLeft     = TOTAL_SECONDS;
  switchCount  = 0;
  currentChord = null;
  prevChord    = null;

  updateTimerDisplay(TOTAL_SECONDS);
  document.getElementById('timerLabel').textContent   = 'Ready';
  document.getElementById('startBtn').disabled        = false;
  document.getElementById('promptChord').textContent  = '—';
  document.getElementById('promptFrom').textContent   = '';
  document.getElementById('statSwitches').textContent = '0';
  document.getElementById('statCurrent').textContent  = '—';
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('ringProgress').style.strokeDashoffset = 0;

  // Remove highlights
  CHORD_KEYS.forEach(k => {
    document.getElementById('card-' + k).classList.remove('active-chord','target-chord');
  });
}

// ============================================================
//  CHORD SWITCHING LOGIC
// ============================================================
function pickNextChord() {
  let candidates = CHORD_KEYS.filter(k => k !== currentChord);
  const next = candidates[Math.floor(Math.random() * candidates.length)];

  // Update classes
  CHORD_KEYS.forEach(k => {
    const card = document.getElementById('card-' + k);
    card.classList.remove('active-chord','target-chord');
  });
  if (currentChord) {
    document.getElementById('card-' + currentChord).classList.add('active-chord');
  }
  document.getElementById('card-' + next).classList.add('target-chord');

  // Animate prompt
  const promptEl = document.getElementById('promptChord');
  promptEl.style.animation = 'none';
  // Force reflow
  void promptEl.offsetWidth;
  promptEl.style.animation = 'chordPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both';
  promptEl.textContent = next;

  const fromEl = document.getElementById('promptFrom');
  fromEl.textContent = currentChord ? `from ${currentChord}` : 'Start here!';

  prevChord    = currentChord;
  currentChord = next;

  switchCount++;
  document.getElementById('statSwitches').textContent = switchCount - 1; // first pick is not a switch
  document.getElementById('statCurrent').textContent  = next;
}

function scheduleSwitchInterval() {
  clearInterval(switchRef);
  switchRef = setInterval(pickNextChord, switchInterval * 1000);
}

function setInterval_(btn, secs) {
  document.querySelectorAll('.interval-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  switchInterval = secs;
  if (timerActive) scheduleSwitchInterval();
}

// ============================================================
//  MANUAL CHORD SELECT
// ============================================================
function selectChord(key) {
  CHORD_KEYS.forEach(k => {
    document.getElementById('card-' + k).classList.remove('active-chord');
  });
  document.getElementById('card-' + key).classList.add('active-chord');
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
  updateTimerDisplay(TOTAL_SECONDS);
});
