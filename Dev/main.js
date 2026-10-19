/**
 * AURA ROSE MILK — HIGH-PERFORMANCE CANVAS SCROLL ANIMATION ENGINE
 * 
 * Features:
 * - 50-frame preloaded 4K enhanced watermark-free sequence
 * - True Full-Screen Retina Canvas with ultra-crisp HiDPI rendering
 * - Pure, distraction-free Apple-style scrollytelling (no intrusive player bars)
 * - 60fps Lerp (Linear Interpolation) physics for silky scroll fluidity
 * - Web Audio API procedural liquid sound synthesis
 * - Interactive Tasting Flight configurator
 */

// Configuration Constants
const TOTAL_FRAMES = 50;
const FRAME_PATH = (i) => `/frames/frame_${String(i).padStart(3, '0')}.jpg`;
const FALLBACK_FRAME_PATH = (i) => `/ezgif-5f238b2527f9e22b-jpg/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
const LERP_FACTOR = 0.14;

// DOM Elements
const canvas = document.getElementById('product-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const heroSection = document.getElementById('hero-section');
const storyTrack = document.querySelector('.story-track');
const scrollPrompt = document.getElementById('scroll-prompt');
const replayBtn = document.getElementById('replay-btn');

// Preloader Elements
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar-fill');
const preloaderCount = document.getElementById('preloader-count');
const preloaderPercent = document.getElementById('preloader-percentage');
const preloaderStatus = document.getElementById('preloader-status');

// Audio Element
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const soundLabel = document.getElementById('sound-label');

// Story Milestones
const milestones = [
  { element: document.getElementById('milestone-1'), start: 0, end: 12 },
  { element: document.getElementById('milestone-2'), start: 13, end: 26 },
  { element: document.getElementById('milestone-3'), start: 27, end: 40 },
  { element: document.getElementById('milestone-4'), start: 41, end: 50 },
];

// State Variables
const frames = [];
let loadedCount = 0;
let currentFrame = 1;
let targetFrame = 1;
let audioContext = null;
let isAudioActive = false;
let dpr = 1;

// ==========================================================================
// 1. FRAME PRELOADING SYSTEM
// ==========================================================================
function preloadAllFrames() {
  return new Promise((resolve) => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      
      const onImageSuccess = () => {
        loadedCount++;
        const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        
        if (preloaderBar) preloaderBar.style.width = `${percent}%`;
        if (preloaderCount) preloaderCount.textContent = `${loadedCount} / ${TOTAL_FRAMES}`;
        if (preloaderPercent) preloaderPercent.textContent = `${percent}%`;

        if (loadedCount === TOTAL_FRAMES) {
          if (preloaderStatus) preloaderStatus.textContent = 'Ultra-HD frames ready. Experience initialized.';
          setTimeout(() => {
            if (preloader) preloader.classList.add('fade-out');
            resolve();
          }, 300);
        }
      };

      img.onload = onImageSuccess;
      img.onerror = () => {
        console.warn(`Primary frame ${i} load failed, trying fallback...`);
        img.onerror = onImageSuccess; // prevent hanging
        img.src = FALLBACK_FRAME_PATH(i);
      };

      img.src = FRAME_PATH(i);
      frames[i] = img;
    }
  });
}

// ==========================================================================
// 2. ULTRA-CRISP RETINA & FULL-SCREEN CANVAS ENGINE
// ==========================================================================
function resizeCanvas() {
  // Use true physical devicePixelRatio for razor-sharp clarity
  dpr = Math.max(1, window.devicePixelRatio || 1);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  renderFrame(currentFrame);
}

function renderFrame(index) {
  const frameIdx = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(index)));
  const img = frames[frameIdx];

  if (!img || !img.complete || img.naturalWidth === 0) return;

  const viewW = canvas.width;
  const viewH = canvas.height;
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  const viewRatio = viewW / viewH;
  const imgRatio = imgW / imgH;

  let drawW, drawH, drawX, drawY;

  // True Full-Screen Cover: image fills entire viewport seamlessly with center crop
  if (viewRatio > imgRatio) {
    drawW = viewW;
    drawH = Math.round(viewW / imgRatio);
    drawX = 0;
    drawY = Math.round((viewH - drawH) / 2);
  } else {
    drawH = viewH;
    drawW = Math.round(viewH * imgRatio);
    drawX = Math.round((viewW - drawW) / 2);
    drawY = 0;
  }

  // Clear with soft studio background color before drawing
  ctx.fillStyle = '#f6d8de';
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

// ==========================================================================
// 3. SMOOTH LERP PHYSICS & ANIMATION LOOP
// ==========================================================================
function animationLoop() {
  const diff = targetFrame - currentFrame;

  if (Math.abs(diff) > 0.001) {
    currentFrame += diff * LERP_FACTOR;
    renderFrame(currentFrame);
    updateMilestones(Math.round(currentFrame));
  }

  requestAnimationFrame(animationLoop);
}

// ==========================================================================
// 4. SCROLL PROGRESS SYNCHRONIZATION
// ==========================================================================
function handleScroll() {
  const trackRect = storyTrack.getBoundingClientRect();
  const totalScrollable = storyTrack.offsetHeight - window.innerHeight;
  const currentScrolled = -trackRect.top;

  let progress = currentScrolled / totalScrollable;
  progress = Math.max(0, Math.min(1, progress));

  // Hide scroll prompt once user starts scrolling
  if (scrollPrompt) {
    if (progress > 0.02) {
      scrollPrompt.style.opacity = '0';
    } else {
      scrollPrompt.style.opacity = '1';
    }
  }

  // Calculate target frame (1 to 50)
  targetFrame = 1 + progress * (TOTAL_FRAMES - 1);

  // Play subtle chime on chapter boundary
  checkAudioTriggers(Math.round(targetFrame));
}

function updateMilestones(frameIndex) {
  const rounded = Math.max(1, Math.min(TOTAL_FRAMES, frameIndex));

  // Update Milestones visibility as user scrolls past
  milestones.forEach((m) => {
    if (m.element) {
      if (rounded >= m.start && rounded <= m.end) {
        m.element.classList.add('visible');
      } else {
        m.element.classList.remove('visible');
      }
    }
  });
}

if (replayBtn) {
  replayBtn.addEventListener('click', () => {
    window.scrollTo({ top: heroSection.offsetTop, behavior: 'smooth' });
  });
}

// ==========================================================================
// 5. WEB AUDIO PROCEDURAL LIQUID HARMONIC SYNTH
// ==========================================================================
if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    isAudioActive = !isAudioActive;
    if (isAudioActive) {
      soundToggleBtn.classList.add('playing');
      soundLabel.textContent = 'Audio On';
      playLiquidTone(currentFrame);
    } else {
      soundToggleBtn.classList.remove('playing');
      soundLabel.textContent = 'Audio Off';
    }
  });
}

let lastToneFrame = 0;
function checkAudioTriggers(frame) {
  if (!isAudioActive || Math.abs(frame - lastToneFrame) < 8) return;
  lastToneFrame = frame;
  playLiquidTone(frame);
}

function playLiquidTone(frame) {
  if (!isAudioActive || !audioContext) return;

  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  // Pentatonic frequency calculation based on frame position
  const baseFreqs = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
  const octaveShift = Math.floor(frame / 12);
  const noteIndex = Math.floor((frame % 12) / 2);
  const freq = (baseFreqs[noteIndex % baseFreqs.length] || 440) * (1 + octaveShift * 0.25);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + 0.35);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(now);
  osc.stop(now + 0.46);
}

// ==========================================================================
// 6. INTERACTIVE TASTING FLIGHT CONFIGURATOR
// ==========================================================================
const sizeBtns = document.querySelectorAll('#size-options .opt-btn');
const sweetBtns = document.querySelectorAll('#sweet-options .opt-btn');
const packBtns = document.querySelectorAll('#pack-selector .pack-btn');
const totalPriceEl = document.getElementById('total-price');
const summarySelectionEl = document.getElementById('summary-selection');
const reserveSubmitBtn = document.getElementById('reserve-submit-btn');
const orderToast = document.getElementById('order-toast');
const toastCloseBtn = document.getElementById('toast-close-btn');

let selectedSize = '330ml';
let basePrice = 9;
let selectedSweet = 'Raw Wildflower';
let selectedQty = 2;

function updateConfigSummary() {
  let discount = 1.0;
  if (selectedQty === 4) discount = 0.90;
  if (selectedQty === 8) discount = 0.80;

  const total = basePrice * selectedQty * discount;
  if (totalPriceEl) totalPriceEl.textContent = `$${total.toFixed(2)}`;
  if (summarySelectionEl) summarySelectionEl.textContent = `${selectedSize} • ${selectedSweet} (${selectedQty}-Pack)`;
}

sizeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sizeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedSize = btn.dataset.size;
    basePrice = parseFloat(btn.dataset.price);
    updateConfigSummary();
  });
});

sweetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sweetBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedSweet = btn.dataset.sweet;
    updateConfigSummary();
  });
});

packBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    packBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedQty = parseInt(btn.dataset.qty, 10);
    updateConfigSummary();
  });
});

if (reserveSubmitBtn) {
  reserveSubmitBtn.addEventListener('click', () => {
    if (orderToast) {
      orderToast.classList.add('show');
      if (isAudioActive) playLiquidTone(50);
      setTimeout(() => {
        orderToast.classList.remove('show');
      }, 4500);
    }
  });
}

if (toastCloseBtn) {
  toastCloseBtn.addEventListener('click', () => {
    if (orderToast) orderToast.classList.remove('show');
  });
}

// ==========================================================================
// 7. INITIALIZATION
// ==========================================================================
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', resizeCanvas);

// Kick off preloader & animation loop
preloadAllFrames().then(() => {
  resizeCanvas();
  handleScroll();
  animationLoop();
});
