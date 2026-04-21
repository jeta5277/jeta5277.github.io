const canvas = document.getElementById('gc');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

/* ── Layout ── */
const DIVIDER_X = Math.floor(W * 0.62);
const LEFT_CX   = DIVIDER_X / 2;
const RIGHT_CX  = DIVIDER_X + (W - DIVIDER_X) / 2;

/* ── Extruders ── */
const EXT_W = 60, EXT_H = 34, EXT_Y = 30;

const EXTRUDERS = [
  { x: LEFT_CX - 90, label: 'Chicken', color: '#d4a96a', w: 1,  nextSpawn: 0,   interval: 210 },
  { x: LEFT_CX,      label: 'Beef',    color: '#a63a2a', w: 5,  nextSpawn: 80,  interval: 250 },
  { x: LEFT_CX + 90, label: 'Veal',    color: '#7a4a28', w: 10, nextSpawn: 150, interval: 230 },
];

/* ── Plate / Scale ── */
const PLATE_CX   = RIGHT_CX;
const PLATE_Y    = H - 70;
const PLATE_RX   = 60, PLATE_RY = 10;
const DISPLAY_X  = PLATE_CX - 45;
const DISPLAY_Y  = H - 48;
const DISPLAY_W  = 90, DISPLAY_H = 28;

/* ── Reset button ── */
const RESET_R = 11;
const RESET_X = DISPLAY_X + DISPLAY_W + 10 + RESET_R;
const RESET_Y = DISPLAY_Y + DISPLAY_H / 2;

/* ── Catcher ── */
const CATCHER_W = 44, CATCHER_H = 8;
const CATCHER_Y = H - 100;
const CATCH_LEFT  = 10;
const CATCH_RIGHT = DIVIDER_X - 10;

/* ── State ── */
let catcherX   = LEFT_CX;
let meatballs  = [];
let plateStack = [];
let plateWeight = 0;
let frame       = 0;
let resetHover  = false;
let onRight     = false;

/* ── Input ── */
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  const my = (e.clientY - rect.top)  * (H / rect.height);

  onRight = mx > DIVIDER_X;
  if (!onRight) {
    catcherX = Math.max(CATCH_LEFT + CATCHER_W / 2,
               Math.min(CATCH_RIGHT - CATCHER_W / 2, mx));
  }

  const dx = mx - RESET_X, dy = my - RESET_Y;
  resetHover = Math.sqrt(dx * dx + dy * dy) <= RESET_R;
  canvas.style.cursor = resetHover ? 'pointer' : onRight ? 'default' : 'none';
});

canvas.addEventListener('mouseleave', () => { onRight = false; });

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  const my = (e.clientY - rect.top)  * (H / rect.height);
  const dx = mx - RESET_X, dy = my - RESET_Y;
  if (Math.sqrt(dx * dx + dy * dy) <= RESET_R) doReset();
});

/* ── Reset ── */
function doReset() {
  meatballs  = [];
  plateStack = [];
  plateWeight = 0;
  EXTRUDERS[0].nextSpawn = frame;
  EXTRUDERS[1].nextSpawn = frame + 80;
  EXTRUDERS[2].nextSpawn = frame + 150;
}

/* ── Spawn ── */
function spawnFrom(ext) {
  meatballs.push({
    x: ext.x,
    y: EXT_Y + EXT_H + 8,
    vy: 0.8,
    w: ext.w,
    r: ext.w === 1 ? 10 : ext.w === 5 ? 13 : 16,
    color: ext.color,
    falling: true,
  });
}

/* ── Draw helpers ── */
function drawDivider() {
  ctx.strokeStyle = '#d3d1c7';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(DIVIDER_X, 10);
  ctx.lineTo(DIVIDER_X, H - 10);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawExtruders() {
  EXTRUDERS.forEach(ext => {
    ctx.fillStyle = '#888780';
    ctx.fillRect(ext.x - EXT_W / 2, EXT_Y, EXT_W, EXT_H);

    ctx.fillStyle = '#f7f3ee';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ext.label, ext.x, EXT_Y + EXT_H / 2 + 4);

    ctx.fillStyle = '#5f5e5a';
    ctx.fillRect(ext.x - 4, EXT_Y + EXT_H, 8, 10);
  });
  ctx.textAlign = 'left';
}

function drawLegend() {
  const cy      = EXT_Y + EXT_H / 2;
  const DOT_R   = 7, GAP = 14, spacing = 65;
  const totalW  = spacing * (EXTRUDERS.length - 1);
  const startX  = RIGHT_CX - totalW / 2;

  EXTRUDERS.forEach((ext, i) => {
    const lx = startX + i * spacing;
    ctx.fillStyle = ext.color;
    ctx.beginPath();
    ctx.arc(lx, cy - 4, DOT_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5f5e5a';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ext.label, lx, cy + DOT_R + GAP);
  });
  ctx.textAlign = 'left';
}

function drawScale() {
  /* plate ellipse */
  ctx.fillStyle = '#b4b2a9';
  ctx.beginPath();
  ctx.ellipse(PLATE_CX, PLATE_Y, PLATE_RX, PLATE_RY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#888780';
  ctx.lineWidth = 1;
  ctx.stroke();

  /* display box */
  ctx.fillStyle = '#888780';
  ctx.fillRect(DISPLAY_X, DISPLAY_Y, DISPLAY_W, DISPLAY_H);
  ctx.fillStyle = '#2c2c2a';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Math.min(plateWeight, 100), PLATE_CX, DISPLAY_Y + DISPLAY_H / 2);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  /* reset button */
  ctx.fillStyle = resetHover ? '#444441' : '#888780';
  ctx.beginPath();
  ctx.arc(RESET_X, RESET_Y, RESET_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7f3ee';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('↺', RESET_X, RESET_Y + 1);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
}

function drawPlateStack() {
  plateStack.forEach(m => {
    ctx.fillStyle = m.color;
    ctx.beginPath();
    ctx.arc(m.px, m.py, m.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCatcher() {
  ctx.fillStyle = '#534ab7';
  ctx.beginPath();
  ctx.roundRect(catcherX - CATCHER_W / 2, CATCHER_Y, CATCHER_W, CATCHER_H, 4);
  ctx.fill();
}

function drawMeatball(m) {
  if (!m.falling) return;
  ctx.fillStyle = m.color;
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
  ctx.fill();
}

/* ── Stack helper ── */
function getStackTop() {
  if (plateStack.length === 0) return PLATE_Y - PLATE_RY;
  const top = plateStack[plateStack.length - 1];
  return top.py - top.r * 2;
}

/* ── Update ── */
function update() {
  frame++;

  EXTRUDERS.forEach(ext => {
    if (frame >= ext.nextSpawn) {
      spawnFrom(ext);
      ext.nextSpawn = frame + ext.interval + Math.floor(Math.random() * 30);
    }
  });

  meatballs.forEach(m => {
    if (!m.falling) return;
    m.y  += m.vy;
    m.vy += 0.03;

    if (m.y + m.r >= CATCHER_Y &&
        m.x > catcherX - CATCHER_W / 2 - m.r &&
        m.x < catcherX + CATCHER_W / 2 + m.r) {
      m.falling = false;
      plateWeight += m.w;
      plateStack.push({
        px: PLATE_CX + (Math.random() - 0.5) * 20,
        py: getStackTop() - m.r,
        r:  m.r,
        color: m.color,
      });
    }
  });

  meatballs = meatballs.filter(m => m.falling && m.y - m.r < H || !m.falling);
}

/* ── Draw ── */
function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#f7f3ee';
  ctx.fillRect(0, 0, W, H);

  drawDivider();
  drawExtruders();
  drawLegend();
  drawPlateStack();
  drawScale();
  drawCatcher();
  meatballs.forEach(drawMeatball);
}

/* ── Loop ── */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();