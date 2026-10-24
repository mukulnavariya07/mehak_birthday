/**
 * Birthday Surprise Website — script.js
 * For: Mehak 🎂
 * All interactions, animations, confetti, sparkles, typing effect.
 */

/* ══════════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════════ */
const state = {
  currentSection: 0,          // which section (0-6) is visible
  candlesBlown: false,        // whether candles have been blown out
  envelopeOpen: false,        // whether surprise envelope is opened
  letterTyping: false,        // is the letter currently typing
  letterDone: false,          // letter fully typed
  confettiRunning: false,
  musicPlaying: false,
};

/* ══════════════════════════════════════════════════════════════
   DOM REFERENCES
══════════════════════════════════════════════════════════════ */
const screens = [
  document.getElementById('screenWelcome'),
  document.getElementById('screenGreeting'),
  document.getElementById('screenCake'),
  document.getElementById('screenSurprise'),
  document.getElementById('screenGallery'),
  document.getElementById('screenLetter'),
  document.getElementById('screenFinal'),
];

const progressDotBtns = document.querySelectorAll('.dot-btn');

const btnReveal      = document.getElementById('btnReveal');
const btnToCake      = document.getElementById('btnToCake');
const btnBlowCandles = document.getElementById('btnBlowCandles');
const btnToSurprise  = document.getElementById('btnToSurprise');
const btnToGallery   = document.getElementById('btnToGallery');
const btnToLetter    = document.getElementById('btnToLetter');
const btnToFinal     = document.getElementById('btnToFinal');
const btnReplay      = document.getElementById('btnReplay');
const btnShare       = document.getElementById('btnShare');
const btnMusicBtn    = document.getElementById('musicBtn');
const bgMusic        = document.getElementById('bgMusic');
const musicIcon      = document.getElementById('musicIcon');
const musicLabel     = document.getElementById('musicLabel');
const shareFeedback  = document.getElementById('shareFeedback');
const messageEnvelope  = document.getElementById('messageEnvelope');
const envelopeMessage  = document.getElementById('envelopeMessage');
const wishMessage    = document.getElementById('wishMessage');
const letterBodyEl   = document.getElementById('letterBody');
const letterFooterEl = document.getElementById('letterFooter');
const confettiCanvas = document.getElementById('confettiCanvas');
const sparkleCanvas  = document.getElementById('sparkleCanvas');
const heartsContainer   = document.getElementById('heartsContainer');
const balloonsContainer = document.getElementById('balloonsContainer');

/* ══════════════════════════════════════════════════════════════
   SECTION NAVIGATION
══════════════════════════════════════════════════════════════ */

/**
 * Show a section by index, hiding all others.
 * Triggers section-specific side-effects.
 * @param {number} idx — target section index (0-6)
 */
function showSection(idx) {
  if (idx < 0 || idx >= screens.length) return;

  // Hide current
  screens[state.currentSection].classList.add('hidden');
  screens[state.currentSection].classList.remove('fade-in');

  // Show new
  state.currentSection = idx;
  const target = screens[idx];
  target.classList.remove('hidden');
  // Trigger reflow for animation
  void target.offsetWidth;
  target.classList.add('fade-in');

  // Update progress dots
  progressDotBtns.forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
    dot.setAttribute('aria-current', i === idx ? 'true' : 'false');
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Section-specific hooks
  onSectionEnter(idx);
}

/**
 * Side-effects when entering a section.
 * @param {number} idx
 */
function onSectionEnter(idx) {
  switch (idx) {
    case 1: // Greeting — launch hearts + balloons
      startFloatingHearts();
      startFloatingBalloons();
      break;
    case 2: // Cake — ensure candles are re-lit on fresh visit
      if (!state.candlesBlown) resetCandles();
      break;
    case 3: // Surprise
      // nothing extra; envelope click handles it
      break;
    case 5: // Letter — start typing animation
      if (!state.letterDone) startLetterTyping();
      break;
    case 6: // Final — launch confetti
      launchConfetti();
      break;
  }
}

/* ══════════════════════════════════════════════════════════════
   BUTTON CLICK HANDLERS
══════════════════════════════════════════════════════════════ */

// Welcome → Greeting
btnReveal.addEventListener('click', () => {
  showSection(1);
  tryPlayMusic();
});

// Greeting → Cake
btnToCake.addEventListener('click', () => showSection(2));

// Cake — blow out candles
btnBlowCandles.addEventListener('click', () => {
  if (state.candlesBlown) return;
  blowOutCandles();
});

// Cake → Surprise
btnToSurprise.addEventListener('click', () => showSection(3));

// Surprise envelope open (click + keyboard)
messageEnvelope.addEventListener('click', openEnvelope);
messageEnvelope.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openEnvelope();
  }
});

// Surprise → Gallery
btnToGallery.addEventListener('click', () => showSection(4));

// Gallery → Letter
btnToLetter.addEventListener('click', () => showSection(5));

// Letter → Final
btnToFinal.addEventListener('click', () => showSection(6));

// Final — Replay
btnReplay.addEventListener('click', replayAll);

// Final — Share (copy URL to clipboard)
btnShare.addEventListener('click', async () => {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  shareFeedback.classList.remove('hidden');
  setTimeout(() => shareFeedback.classList.add('hidden'), 3500);
});

// Progress dots navigation
progressDotBtns.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    // Only allow navigating to already-visited sections (≤ currentSection)
    // or allow free navigation (remove condition below for unrestricted access)
    showSection(i);
  });
});

/* ══════════════════════════════════════════════════════════════
   CANDLE INTERACTIONS
══════════════════════════════════════════════════════════════ */

function blowOutCandles() {
  const candles = document.querySelectorAll('.candle');
  state.candlesBlown = true;

  // Blow out one-by-one with small delay
  candles.forEach((candle, i) => {
    setTimeout(() => {
      candle.classList.add('blown');
    }, i * 180);
  });

  // After all blown, show wish + next button
  setTimeout(() => {
    wishMessage.classList.remove('hidden');
    btnBlowCandles.disabled = true;
    btnBlowCandles.style.opacity = '0.5';
    btnToSurprise.classList.remove('hidden');
    // Mini confetti burst on cake blow
    launchConfetti(true);
  }, candles.length * 180 + 400);
}

function resetCandles() {
  const candles = document.querySelectorAll('.candle');
  candles.forEach(c => c.classList.remove('blown'));
}

/* ══════════════════════════════════════════════════════════════
   ENVELOPE / SURPRISE MESSAGE
══════════════════════════════════════════════════════════════ */

function openEnvelope() {
  if (state.envelopeOpen) return;
  state.envelopeOpen = true;

  // Flip envelope
  const front = messageEnvelope.querySelector('.envelope-front');
  front.style.display = 'none';
  envelopeMessage.classList.remove('hidden');
  envelopeMessage.removeAttribute('aria-hidden');
  messageEnvelope.setAttribute('aria-expanded', 'true');
  messageEnvelope.style.cursor = 'default';
  messageEnvelope.setAttribute('tabindex', '-1');

  // Confetti burst
  launchConfetti(true);

  // Reveal next button after short delay
  setTimeout(() => {
    btnToGallery.classList.remove('hidden');
  }, 1200);
}

/* ══════════════════════════════════════════════════════════════
   LETTER TYPING ANIMATION
══════════════════════════════════════════════════════════════ */

const LETTER_TEXT = `Today is a very special day — because you were born, and the world became a more beautiful, more loving, more joyful place because of it. 🌸

I remember watching you grow from a bright little spark into the incredible woman you are today. Your strength, your warmth, your laugh that fills every corner of the room — Mehak, you are truly one of a kind.

Life isn't always easy, but you face every challenge with a grace that leaves me in awe. You carry kindness in your heart like it's the easiest thing in the world, and maybe for you — it really is.

On this birthday, I want you to know: you are deeply loved. Not just for what you do, but for who you are — every little quirk, every dream, every beautiful piece of you.

May this year bring you everything your heart desires. May you wake up every morning feeling excited about the day ahead. May every dream you've whispered in the quiet of the night start coming true. 🌟

You deserve all of it — the laughter, the adventures, the love, the peace — every bit of joy this world has to offer.

Happy Birthday, Mehak. Here's to you. 🥂💗`;

let typingTimeout = null;

function startLetterTyping() {
  if (state.letterTyping || state.letterDone) return;
  state.letterTyping = true;

  letterBodyEl.innerHTML = '';

  // Create a cursor
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  letterBodyEl.appendChild(cursor);

  // Split text into paragraphs
  const paragraphs = LETTER_TEXT.split('\n\n');
  let paraIdx = 0;
  let charIdx = 0;
  let currentPara = null;

  function typeNext() {
    if (paraIdx >= paragraphs.length) {
      // Done
      cursor.remove();
      state.letterTyping = false;
      state.letterDone = true;
      letterFooterEl.classList.remove('hidden');
      btnToFinal.classList.remove('hidden');
      return;
    }

    if (charIdx === 0) {
      // Start new paragraph element
      currentPara = document.createElement('p');
      currentPara.style.marginBottom = '16px';
      letterBodyEl.insertBefore(currentPara, cursor);
    }

    const para = paragraphs[paraIdx];

    if (charIdx < para.length) {
      currentPara.textContent += para[charIdx];
      charIdx++;
      typingTimeout = setTimeout(typeNext, 22);
    } else {
      // Move to next paragraph
      paraIdx++;
      charIdx = 0;
      currentPara = null;
      typingTimeout = setTimeout(typeNext, 260);
    }
  }

  typeNext();
}

/* ══════════════════════════════════════════════════════════════
   REPLAY
══════════════════════════════════════════════════════════════ */

function replayAll() {
  // Reset state
  state.candlesBlown = false;
  state.envelopeOpen = false;
  state.letterTyping = false;
  state.letterDone   = false;

  // Reset candles
  resetCandles();
  btnBlowCandles.disabled = false;
  btnBlowCandles.style.opacity = '1';
  wishMessage.classList.add('hidden');
  btnToSurprise.classList.add('hidden');

  // Reset envelope
  const front = messageEnvelope.querySelector('.envelope-front');
  front.style.display = '';
  envelopeMessage.classList.add('hidden');
  envelopeMessage.setAttribute('aria-hidden', 'true');
  messageEnvelope.setAttribute('aria-expanded', 'false');
  messageEnvelope.style.cursor = 'pointer';
  messageEnvelope.setAttribute('tabindex', '0');
  btnToGallery.classList.add('hidden');

  // Reset letter
  if (typingTimeout) clearTimeout(typingTimeout);
  letterBodyEl.innerHTML = '';
  letterFooterEl.classList.add('hidden');
  btnToFinal.classList.add('hidden');

  // Reset share
  shareFeedback.classList.add('hidden');

  // Go back to welcome
  showSection(0);
}

/* ══════════════════════════════════════════════════════════════
   MUSIC PLAYER
══════════════════════════════════════════════════════════════ */

function tryPlayMusic() {
  // Only attempt if a src exists and not already playing
  if (state.musicPlaying) return;
  if (!bgMusic.src || bgMusic.src.endsWith('music.mp3') === false) return;
  bgMusic.volume = 0.4;
  bgMusic.play()
    .then(() => {
      state.musicPlaying = true;
      musicIcon.textContent  = '🔊';
      musicLabel.textContent = 'Pause Music';
    })
    .catch(() => {
      // Autoplay blocked — button will trigger play manually
    });
}

btnMusicBtn.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.volume = 0.4;
    bgMusic.play()
      .then(() => {
        state.musicPlaying = true;
        musicIcon.textContent  = '🔊';
        musicLabel.textContent = 'Pause Music';
      })
      .catch(err => console.warn('Music play failed:', err));
  } else {
    bgMusic.pause();
    state.musicPlaying = false;
    musicIcon.textContent  = '🎵';
    musicLabel.textContent = 'Play Music';
  }
});

/* ══════════════════════════════════════════════════════════════
   FLOATING HEARTS
══════════════════════════════════════════════════════════════ */

const HEARTS = ['💗', '💕', '💖', '💞', '🌸', '✨', '💝', '🌼'];
let heartsInterval = null;

function startFloatingHearts() {
  if (heartsInterval) return; // already running
  heartsInterval = setInterval(spawnHeart, 900);
}

function spawnHeart() {
  const el = document.createElement('div');
  el.className = 'floating-heart';
  el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  el.style.left = `${Math.random() * 96}%`;
  const duration = 6 + Math.random() * 6;
  el.style.animationDuration = `${duration}s`;
  el.style.animationDelay    = `${Math.random() * 1.5}s`;
  el.style.fontSize          = `${0.9 + Math.random() * 1.4}rem`;
  heartsContainer.appendChild(el);

  // Remove after animation
  setTimeout(() => el.remove(), (duration + 1.5) * 1000);
}

/* ══════════════════════════════════════════════════════════════
   FLOATING BALLOONS
══════════════════════════════════════════════════════════════ */

const BALLOON_COLORS = [
  '#f8a4c4', '#c3b1e1', '#f5c842', '#ff9eb5', '#b3d9ff', '#c8f5c8'
];
let balloonsInterval = null;

function startFloatingBalloons() {
  if (balloonsInterval) return;
  balloonsInterval = setInterval(spawnBalloon, 2200);
  spawnBalloon(); // spawn one immediately
}

function spawnBalloon() {
  const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
  const el = document.createElement('div');
  el.className = 'balloon';

  const body = document.createElement('div');
  body.className = 'balloon-body';
  body.style.background = color;

  const knot = document.createElement('div');
  knot.className = 'balloon-knot';
  knot.style.background = color;

  el.appendChild(body);
  el.appendChild(knot);

  el.style.left = `${5 + Math.random() * 88}%`;
  const duration = 9 + Math.random() * 9;
  el.style.animationDuration  = `${duration}s`;
  el.style.animationDelay     = `${Math.random() * 2}s`;
  el.style.transform          = `scale(${0.7 + Math.random() * 0.8})`;

  balloonsContainer.appendChild(el);
  setTimeout(() => el.remove(), (duration + 2) * 1000);
}

/* ══════════════════════════════════════════════════════════════
   SPARKLE CANVAS
══════════════════════════════════════════════════════════════ */

const sparkCtx = sparkleCanvas.getContext('2d');
const sparkles  = [];

function resizeSparkleCanvas() {
  sparkleCanvas.width  = window.innerWidth;
  sparkleCanvas.height = window.innerHeight;
}

resizeSparkleCanvas();
window.addEventListener('resize', resizeSparkleCanvas);

// Spawn sparkles on mouse / touch move
document.addEventListener('mousemove', (e) => spawnSparkle(e.clientX, e.clientY));
document.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  spawnSparkle(t.clientX, t.clientY);
}, { passive: true });

function spawnSparkle(x, y) {
  const count = 2;
  for (let i = 0; i < count; i++) {
    sparkles.push({
      x, y,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -1.5 - Math.random() * 2,
      alpha: 1,
      radius: 2 + Math.random() * 3,
      color: pickSparkleColor(),
      life: 0,
      maxLife: 40 + Math.random() * 30,
    });
  }
}

function pickSparkleColor() {
  const colors = ['#f8a4c4', '#c3b1e1', '#f5c842', '#ff9eb5', '#ffffff', '#d4a017'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function animateSparkles() {
  sparkCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.x  += s.vx;
    s.y  += s.vy;
    s.vy += 0.06; // gravity
    s.life++;
    s.alpha = 1 - s.life / s.maxLife;

    if (s.alpha <= 0) { sparkles.splice(i, 1); continue; }

    sparkCtx.save();
    sparkCtx.globalAlpha = s.alpha;
    sparkCtx.fillStyle   = s.color;
    sparkCtx.shadowBlur  = 8;
    sparkCtx.shadowColor = s.color;
    sparkCtx.beginPath();
    sparkCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    sparkCtx.fill();
    sparkCtx.restore();
  }

  requestAnimationFrame(animateSparkles);
}

animateSparkles();

/* ══════════════════════════════════════════════════════════════
   CONFETTI
══════════════════════════════════════════════════════════════ */

const confCtx    = confettiCanvas.getContext('2d');
let confettiPcs  = [];
let confettiAnim = null;

const CONFETTI_COLORS = [
  '#f8a4c4', '#c3b1e1', '#f5c842', '#ff9eb5', '#b3d9ff',
  '#fde8f1', '#e8769f', '#9b7fc9', '#d4a017', '#ffffff',
];

function resizeConfettiCanvas() {
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

resizeConfettiCanvas();
window.addEventListener('resize', resizeConfettiCanvas);

/**
 * Launch confetti.
 * @param {boolean} mini — small burst (fewer pieces) or full celebration
 */
function launchConfetti(mini = false) {
  if (state.confettiRunning && !mini) return;

  const count = mini ? 80 : 200;

  for (let i = 0; i < count; i++) {
    confettiPcs.push({
      x: Math.random() * confettiCanvas.width,
      y: -10 - Math.random() * confettiCanvas.height * 0.3,
      w: 6 + Math.random() * 10,
      h: 8 + Math.random() * 14,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.18,
      alpha: 1,
      life: 0,
      maxLife: 180 + Math.random() * 120,
      shape: Math.random() < 0.4 ? 'circle' : 'rect',
    });
  }

  if (!state.confettiRunning) {
    state.confettiRunning = true;
    animateConfetti();
  }
}

function animateConfetti() {
  confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  let stillAlive = false;

  for (let i = confettiPcs.length - 1; i >= 0; i--) {
    const p = confettiPcs[i];
    p.x   += p.vx;
    p.y   += p.vy;
    p.spin += p.spinSpeed;
    p.vy  += 0.04; // gravity
    p.vx  += (Math.random() - 0.5) * 0.1; // wobble
    p.life++;

    if (p.life > p.maxLife * 0.7) {
      p.alpha = 1 - (p.life - p.maxLife * 0.7) / (p.maxLife * 0.3);
    }

    if (p.alpha <= 0 || p.y > confettiCanvas.height + 20) {
      confettiPcs.splice(i, 1);
      continue;
    }

    stillAlive = true;

    confCtx.save();
    confCtx.globalAlpha = Math.max(0, p.alpha);
    confCtx.fillStyle   = p.color;
    confCtx.translate(p.x, p.y);
    confCtx.rotate(p.spin);

    if (p.shape === 'circle') {
      confCtx.beginPath();
      confCtx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
      confCtx.fill();
    } else {
      confCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }

    confCtx.restore();
  }

  if (stillAlive) {
    confettiAnim = requestAnimationFrame(animateConfetti);
  } else {
    state.confettiRunning = false;
    confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */

/**
 * Initial setup — show the welcome screen and start
 * ambient sparkle + reduced-motion detection.
 */
function init() {
  // Ensure only welcome screen is visible
  screens.forEach((s, i) => {
    if (i === 0) {
      s.classList.remove('hidden');
    } else {
      s.classList.add('hidden');
    }
  });

  // If user prefers reduced motion, skip floating elements
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    heartsContainer.style.display  = 'none';
    balloonsContainer.style.display = 'none';
  }

  // Music: hide the button if no audio source is available
  // (checks if the src ends in a default placeholder)
  bgMusic.addEventListener('error', () => {
    document.getElementById('musicPlayer').style.display = 'none';
  });
}

init();
