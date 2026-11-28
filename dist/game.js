import { generatePores } from './layout.js?v=2';
const $ = (selector) => document.querySelector(selector);
const COUNT = 16;
const state = { scene: 'peach', mode: 'drag', cleared: 0, round: 1, total: 0, sound: true, active: null, generation: 0 };
let audio;
let completionTimer;
try {
  const saved = JSON.parse(localStorage.getItem('pore-peace-v1') || '{}');
  state.total = Number.isSafeInteger(saved.total) && saved.total >= 0 ? saved.total : 0;
  state.sound = saved.sound !== false;
} catch { /* The game also works when storage is unavailable. */ }
function persist() {
  try { localStorage.setItem('pore-peace-v1', JSON.stringify({ total: state.total, sound: state.sound })); } catch { /* Optional storage. */ }
}
function initAudio() {
  if (!state.sound) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (Audio && !audio) audio = new Audio();
    if (audio?.state === 'suspended') audio.resume().catch(() => {});
  } catch { /* Audio is optional. */ }
}
function popSound() {
  if (!state.sound || !audio) return;
  try {
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420 + Math.random() * 160, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + .11);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.2, now + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .18);
    osc.connect(gain).connect(audio.destination);
    osc.start(now); osc.stop(now + .2);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  } catch { /* Muted/unsupported devices remain playable. */ }
}
function updateSound() {
  $('#sound').setAttribute('aria-pressed', String(state.sound));
  $('#sound').setAttribute('aria-label', state.sound ? '关闭音效' : '开启音效');
}
function updateProgress() {
  const percent = Math.round(state.cleared / COUNT * 100);
  $('#percent').textContent = `${percent}%`;
  $('#progress').style.width = `${percent}%`;
  $('.progress-track').setAttribute('aria-valuenow', state.cleared);
  $('#remaining').textContent = state.cleared === COUNT ? '全部清空啦' : `还剩 ${COUNT - state.cleared} 颗`;
  $('#tray-count').textContent = `${state.cleared} / ${COUNT}`;
  $('#total').textContent = state.total;
  [...$('#tray').children].forEach((slot, index) => slot.classList.toggle('filled', index < state.cleared));
}
function cancelPull() {
  if (!state.active) return;
  cancelAnimationFrame(state.active.frame);
  const { el, pointerId } = state.active;
  state.active = null;
  el.classList.remove('pulling');
  el.style.setProperty('--pull', '0px');
  if (pointerId != null && el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
}
function celebrate(el) {
  const stage = $('#stage').getBoundingClientRect();
  const pore = el.getBoundingClientRect();
  const x = pore.left + pore.width / 2 - stage.left;
  const y = pore.top - stage.top - 45;
  const label = $('#pop-label');
  label.textContent = ['噗！', '轻松 +1', '好舒服～', '烦恼 −1'][Math.floor(Math.random() * 4)];
  label.style.left = `${x}px`; label.style.top = `${y}px`;
  label.classList.remove('show'); void label.offsetWidth; label.classList.add('show');
  for (let i = 0; i < 9; i++) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.style.left = `${x}px`; particle.style.top = `${y + 35}px`;
    particle.style.setProperty('--dx', `${(Math.random() - .5) * 110}px`);
    particle.style.setProperty('--dy', `${-20 - Math.random() * 75}px`);
    particle.style.background = ['#fff5ca', '#fff', '#b797ce'][i % 3];
    $('#stage').append(particle); setTimeout(() => particle.remove(), 800);
  }
}
function finish(el) {
  if (el.disabled || !el.isConnected) return;
  const wasKeyboard = state.active?.keyboard;
  cancelPull();
  el.disabled = true;
  el.classList.add('cleared');
  el.setAttribute('aria-label', '已经清理干净');
  state.cleared++; state.total++;
  updateProgress(); persist(); popSound(); celebrate(el);
  if (navigator.vibrate) navigator.vibrate(18);
  $('#announcement').textContent = `拔出成功！已清理 ${state.cleared} 颗，还剩 ${COUNT - state.cleared} 颗。`;
  if (wasKeyboard && state.cleared < COUNT) $('#pores .pore:not(:disabled)')?.focus({ preventScroll: true });
  if (state.cleared === COUNT) {
    $('#hint').textContent = '干干净净，心情也亮了一点';
    const generation = state.generation;
    completionTimer = setTimeout(() => { if (generation === state.generation) $('#complete-dialog').showModal(); }, 650);
  }
}
function animatePull(el, keyboard = false) {
  cancelPull(); initAudio();
  state.active = { el, keyboard, frame: null };
  el.classList.add('pulling');
  const started = performance.now();
  const tick = (now) => {
    if (state.active?.el !== el) return;
    const progress = Math.min((now - started) / 650, 1);
    el.style.setProperty('--pull', `${progress * 64}px`);
    if (progress >= 1) finish(el);
    else state.active.frame = requestAnimationFrame(tick);
  };
  state.active.frame = requestAnimationFrame(tick);
}
function createPore(index, pore) {
  const el = document.createElement('button');
  el.className = 'pore';
  el.setAttribute('aria-label', `拔出第 ${index + 1} 颗黑头`);
  el.style.left = `${pore.x}%`;
  el.style.top = `${pore.y}%`;
  el.style.setProperty('--pore-size', `${pore.size}px`);
  el.style.setProperty('--pore-angle', `${pore.angle}deg`);
  el.style.setProperty('--pore-shade', pore.shade);
  el.innerHTML = '<span class="pore-stem"></span><span class="pore-core"></span><span class="tweezers"></span>';
  el.addEventListener('pointerdown', (event) => {
    if (el.disabled || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if (state.mode === 'tap') { initAudio(); return; }
    event.preventDefault(); cancelPull(); initAudio();
    el.setPointerCapture(event.pointerId);
    state.active = { el, startY: event.clientY, pointerId: event.pointerId, frame: null };
    el.classList.add('pulling');
  });
  el.addEventListener('pointermove', (event) => {
    const active = state.active;
    if (!active || active.el !== el || active.pointerId !== event.pointerId) return;
    const pull = Math.max(0, active.startY - event.clientY);
    el.style.setProperty('--pull', `${Math.min(pull, 64)}px`);
    if (pull >= 64) finish(el);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    el.addEventListener(name, (event) => {
      if (state.active?.el === el && state.active.pointerId === event.pointerId) cancelPull();
    });
  }
  el.addEventListener('click', (event) => {
    if (el.disabled) return;
    // detail=0 is keyboard/assistive activation; it works in either mode.
    if (state.mode === 'tap' || event.detail === 0) animatePull(el, event.detail === 0);
  });
  return el;
}
function newRound(increment = true) {
  cancelPull(); clearTimeout(completionTimer); state.generation++;
  if ($('#complete-dialog').open) $('#complete-dialog').close();
  state.cleared = 0;
  if (increment) state.round++;
  $('#round-label').textContent = `你的第 ${state.round} 次小放松`;
  $('#pores').replaceChildren(...generatePores(COUNT).map((pore, i) => createPore(i, pore)));
  $('#tray').replaceChildren(...Array.from({ length: COUNT }, () => { const el = document.createElement('i'); el.className = 'tray-slot'; return el; }));
  $('#skin').className = `skin ${state.scene}`;
  $('#pop-label').classList.remove('show');
  document.querySelectorAll('.particle').forEach(el => el.remove());
  setHint(); updateProgress();
}
function setHint() {
  $('#hint').textContent = state.mode === 'drag' ? '按住一颗黑头，轻轻向上拔' : '点一下黑头，把小烦恼交给镊子';
}
function setMode(mode) {
  cancelPull(); state.mode = mode;
  for (const value of ['drag', 'tap']) {
    $(`#${value}-mode`).classList.toggle('active', mode === value);
    $(`#${value}-mode`).setAttribute('aria-pressed', String(mode === value));
  }
  $('#mode-detail').innerHTML = mode === 'drag' ? '按住黑头向上拖动。<br>拉得越长，离轻松越近。' : '轻点一颗，自动慢慢拔出。<br>让手指也休息一下。';
  setHint();
}
$('#drag-mode').addEventListener('click', () => setMode('drag'));
$('#tap-mode').addEventListener('click', () => setMode('tap'));
$('#sound').addEventListener('click', () => { state.sound = !state.sound; updateSound(); persist(); if (state.sound) { initAudio(); popSound(); } });
$('#reset').addEventListener('click', () => newRound());
$('#next-round').addEventListener('click', () => { newRound(); $('#pores .pore').focus({ preventScroll: true }); });
$('#enjoy').addEventListener('click', () => { $('#complete-dialog').close(); $('#reset').focus({ preventScroll: true }); });
$('#help').addEventListener('click', () => { cancelPull(); $('#help-dialog').showModal(); });
$('.dialog-close').addEventListener('click', () => $('#help-dialog').close());
$('.primary.dialog-close').addEventListener('click', () => $('#help-dialog').close());
document.querySelectorAll('.scene').forEach(button => button.addEventListener('click', () => {
  if (state.scene === button.dataset.scene) return;
  state.scene = button.dataset.scene;
  document.querySelectorAll('.scene').forEach(el => {
    el.classList.toggle('active', el === button); el.setAttribute('aria-pressed', String(el === button));
  });
  newRound();
}));
window.addEventListener('blur', cancelPull);
document.addEventListener('visibilitychange', () => { if (document.hidden) cancelPull(); });
updateSound(); newRound(false);
