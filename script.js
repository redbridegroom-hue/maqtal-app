/* ============================================
   MAQTAL AL-HUSSAIN — INTERACTIVE SCRIPTS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const audio = document.getElementById('audio-element');
  const playBtn = document.getElementById('audio-play-btn');
  const progressBar = document.getElementById('audio-progress-bar');
  const progressFill = document.getElementById('audio-progress-fill');
  const timeDisplay = document.getElementById('audio-time');
  const volumeSlider = document.getElementById('audio-volume');
  const volBtn = document.getElementById('audio-vol-btn');
  const speedBtn = document.getElementById('audio-speed-btn');
  const audioPlayer = document.getElementById('audio-player');
  const readingProgress = document.getElementById('reading-progress');
  const nav = document.getElementById('main-nav');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const sectionNavDots = document.querySelectorAll('.section-nav-dot');
  const audioVisualizer = document.getElementById('audio-visualizer');

  // --- State ---
  let lastScrollY = 0;
  let isPlaying = false;
  let isMuted = false;
  let currentSpeed = 1;
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // --- Audio Player Visibility ---
  const heroSection = document.getElementById('hero');

  const showPlayerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        audioPlayer.classList.add('visible');
      } else {
        if (!isPlaying) {
          audioPlayer.classList.remove('visible');
        }
      }
    });
  }, { threshold: 0.3 });

  showPlayerObserver.observe(heroSection);

  // Play / Pause
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = '⏸';
      isPlaying = true;
      audioPlayer.classList.add('visible');
      document.body.classList.add('audio-playing');
      if (audioVisualizer) audioVisualizer.classList.add('active-visualizer');
    } else {
      audio.pause();
      playBtn.textContent = '▶';
      isPlaying = false;
      document.body.classList.remove('audio-playing');
      if (audioVisualizer) audioVisualizer.classList.remove('active-visualizer');
    }
  });

  // Time update — progress bar + time display + block highlighting
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      timeDisplay.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
      updateActiveBlock(audio.currentTime);
    }
  });

  // Seeking
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  // Volume
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      audio.volume = e.target.value;
      isMuted = audio.volume === 0;
      volBtn.textContent = isMuted ? '🔇' : (audio.volume < 0.5 ? '🔉' : '🔊');
    });
  }

  if (volBtn) {
    volBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      audio.muted = isMuted;
      if (volumeSlider) volumeSlider.value = isMuted ? 0 : 1;
      volBtn.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  // Speed
  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      const idx = speeds.indexOf(currentSpeed);
      currentSpeed = speeds[(idx + 1) % speeds.length];
      audio.playbackRate = currentSpeed;
      speedBtn.textContent = currentSpeed + 'x';
    });
  }

  // Audio ended
  audio.addEventListener('ended', () => {
    playBtn.textContent = '▶';
    isPlaying = false;
    progressFill.style.width = '0%';
    document.body.classList.remove('audio-playing');
    if (audioVisualizer) audioVisualizer.classList.remove('active-visualizer');
    clearActiveBlock();
  });

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  // =============================================
  //  BLOCK-LEVEL HIGHLIGHTING
  // =============================================

  const allBlocks = Array.from(
    document.querySelectorAll('.narrative-section .text-block, .narrative-section .poetry-block')
  );

  let blockTimestamps = [];
  let activeBlockIndex = -1;
  let autoScrollEnabled = true;
  let scrollPauseTimeout = null;

  /**
   * Proportionally distribute timestamps based on Arabic text length
   */
  function calculateBlockTimestamps(duration) {
    const lengths = allBlocks.map(block => {
      const arabicText = block.querySelector('.arabic-text');
      if (arabicText) return arabicText.textContent.trim().length;

      const arabicLines = block.querySelectorAll('.arabic-line');
      if (arabicLines.length) {
        return Array.from(arabicLines).reduce(
          (sum, line) => sum + line.textContent.trim().length, 0
        );
      }

      const quranVerse = block.querySelector('.quran-verse');
      if (quranVerse) return quranVerse.textContent.trim().length;

      return 50;
    });

    const totalLength = lengths.reduce((a, b) => a + b, 0);
    const timestamps = [];
    let cumulative = 0;

    for (let i = 0; i < lengths.length; i++) {
      timestamps.push((cumulative / totalLength) * duration);
      cumulative += lengths[i];
    }

    return timestamps;
  }

  function ensureTimestamps() {
    if (!blockTimestamps.length && audio.duration && audio.duration !== Infinity) {
      blockTimestamps = calculateBlockTimestamps(audio.duration);
    }
    return blockTimestamps.length > 0;
  }

  audio.addEventListener('loadedmetadata', () => { ensureTimestamps(); });
  audio.addEventListener('canplay', () => { ensureTimestamps(); });

  /**
   * Update the active block based on current audio time
   */
  function updateActiveBlock(currentTime) {
    if (!ensureTimestamps()) return;

    let newIndex = -1;
    for (let i = blockTimestamps.length - 1; i >= 0; i--) {
      if (currentTime >= blockTimestamps[i]) {
        newIndex = i;
        break;
      }
    }

    if (newIndex === activeBlockIndex) return;

    // Remove old
    if (activeBlockIndex >= 0 && activeBlockIndex < allBlocks.length) {
      allBlocks[activeBlockIndex].classList.remove('active-block');
      const oldSection = allBlocks[activeBlockIndex].closest('.narrative-section');
      if (oldSection) oldSection.classList.remove('section-active');
    }

    activeBlockIndex = newIndex;

    // Add new
    if (activeBlockIndex >= 0 && activeBlockIndex < allBlocks.length) {
      const activeBlock = allBlocks[activeBlockIndex];
      activeBlock.classList.add('active-block');

      const activeSection = activeBlock.closest('.narrative-section');
      if (activeSection) activeSection.classList.add('section-active');

      // Auto-scroll
      if (autoScrollEnabled && isPlaying) {
        const blockRect = activeBlock.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // Scroll if block is outside vertical bounds
        if (blockRect.top < 150 || blockRect.top > viewportHeight * 0.7) {
          activeBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }

  function clearActiveBlock() {
    if (activeBlockIndex >= 0 && activeBlockIndex < allBlocks.length) {
      allBlocks[activeBlockIndex].classList.remove('active-block');
      const section = allBlocks[activeBlockIndex].closest('.narrative-section');
      if (section) section.classList.remove('section-active');
    }
    activeBlockIndex = -1;
  }

  // Pause auto-scroll on manual scroll
  function pauseAutoScroll() {
    autoScrollEnabled = false;
    clearTimeout(scrollPauseTimeout);
    scrollPauseTimeout = setTimeout(() => { autoScrollEnabled = true; }, 4000);
  }
  window.addEventListener('wheel', pauseAutoScroll, { passive: true });
  window.addEventListener('touchmove', pauseAutoScroll, { passive: true });

  // =============================================
  //  SCROLL ANIMATIONS & UI
  // =============================================

  const animatedElements = document.querySelectorAll('.narrative-section, .fade-in, .ornament-divider');

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => scrollObserver.observe(el));

  // --- Reading Progress Bar ---
  function updateReadingProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (scrollTop / docHeight) * 100;
    readingProgress.style.width = Math.min(pct, 100) + '%';
  }

  // --- Nav hide/show and scroll styling ---
  function handleNavScroll() {
    const scrollY = window.scrollY;
    
    // Add scrolled class for glass effect on nav
    if (scrollY > 50) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }

    if (scrollY > lastScrollY && scrollY > 200) {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }
    lastScrollY = scrollY;
  }

  // --- Section Nav Dots ---
  const sections = [];
  sectionNavDots.forEach(dot => {
    const targetId = dot.getAttribute('data-target');
    const section = document.getElementById(targetId);
    if (section) sections.push({ dot, section });

    dot.addEventListener('click', () => {
      const target = document.getElementById(targetId);
      if (target) {
        // adjust for fixed header
        const y = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({top: y, behavior: 'smooth'});
      }
    });
  });

  function updateActiveDot() {
    const scrollMid = window.scrollY + window.innerHeight / 3;
    let activeIdx = 0;
    sections.forEach((item, idx) => {
      if (item.section.offsetTop <= scrollMid) activeIdx = idx;
    });
    sections.forEach((item, idx) => {
      item.dot.classList.toggle('active', idx === activeIdx);
    });
  }

  // --- Throttled Scroll Handler ---
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateReadingProgress();
        handleNavScroll();
        updateActiveDot();
        ticking = false;
      });
      ticking = true;
    }
  });

  // --- Mobile Menu ---
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', () => {
      closeMobileMenu();
    });
  }

  // --- Nav Links Active State ---
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // --- Initial state ---
  updateReadingProgress();
  updateActiveDot();
  handleNavScroll();

  // =============================================
  //  ADVANCED APP CAPABILITIES (PWA, Theme, Share, Skip)
  // =============================================

  // --- 1. Service Worker Registration (PWA) ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, (err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }

  // --- 2. Advanced Audio Controls (Skip) ---
  const skipFwdBtn = document.getElementById('audio-skip-fwd');
  const skipBackBtn = document.getElementById('audio-skip-back');

  if (skipFwdBtn) {
    skipFwdBtn.addEventListener('click', () => {
      audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
    });
  }
  if (skipBackBtn) {
    skipBackBtn.addEventListener('click', () => {
      audio.currentTime = Math.max(audio.currentTime - 10, 0);
    });
  }

  // --- 3. Advanced Theme Studio Engine ---
  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const closeSettingsBtn = document.getElementById('close-settings');

  // Modal Toggling
  if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener('click', (e) => {
      settingsPanel.classList.toggle('open');
      e.stopPropagation();
    });
    
    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener('click', () => {
        settingsPanel.classList.remove('open');
      });
    }

    document.addEventListener('click', (e) => {
      if (settingsPanel.classList.contains('open') && !settingsPanel.contains(e.target) && e.target !== settingsBtn) {
        settingsPanel.classList.remove('open');
      }
    });
  }

  // State Management
  let themeState = {
    preset: 'dark',
    accent: 'gold',
    scaleAr: 1,
    scaleEn: 1,
    translit: false
  };

  // Color Palettes Mapping
  const colorPalettes = {
    gold: { base: '#b0821c', light: '#8b6b23', dim: 'rgba(176, 130, 28, 0.05)', glow: 'rgba(176, 130, 28, 0.5)', border: 'rgba(176, 130, 28, 0.3)' },
    crimson: { base: '#e63946', light: '#fca311', dim: 'rgba(230, 57, 70, 0.05)', glow: 'rgba(230, 57, 70, 0.5)', border: 'rgba(230, 57, 70, 0.3)' },
    emerald: { base: '#2a9d8f', light: '#e9c46a', dim: 'rgba(42, 157, 143, 0.05)', glow: 'rgba(42, 157, 143, 0.5)', border: 'rgba(42, 157, 143, 0.3)' },
    sapphire: { base: '#457b9d', light: '#a8dadc', dim: 'rgba(69, 123, 157, 0.05)', glow: 'rgba(69, 123, 157, 0.5)', border: 'rgba(69, 123, 157, 0.3)' },
    amethyst: { base: '#9d4edd', light: '#c8b6ff', dim: 'rgba(157, 78, 221, 0.05)', glow: 'rgba(157, 78, 221, 0.5)', border: 'rgba(157, 78, 221, 0.3)' },
    rosegold: { base: '#b56576', light: '#e5989b', dim: 'rgba(181, 101, 118, 0.05)', glow: 'rgba(181, 101, 118, 0.5)', border: 'rgba(181, 101, 118, 0.3)' },
    ruby: { base: '#9a031e', light: '#ffb703', dim: 'rgba(154, 3, 30, 0.05)', glow: 'rgba(154, 3, 30, 0.5)', border: 'rgba(154, 3, 30, 0.3)' }
  };

  // Dynamic Stylesheet Injector
  const dynamicStyle = document.createElement('style');
  dynamicStyle.id = 'theme-studio-styles';
  document.head.appendChild(dynamicStyle);

  function applyThemeState() {
    // 1. Preset
    document.body.className = '';
    // If not 'dark' (which is the default without a class), add the theme class.
    if (themeState.preset !== 'dark') document.body.classList.add(`theme-${themeState.preset}`);

    // Update preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === themeState.preset);
    });

    // 2. Accent Colors & Typography via dynamic CSS
    const colors = colorPalettes[themeState.accent];
    dynamicStyle.innerHTML = `
      :root {
        --gold-base: ${colors.base} !important;
        --gold-light: ${colors.light} !important;
        --gold-dim: ${colors.dim} !important;
        --gold-glow: ${colors.glow} !important;
        --border-gold: ${colors.border} !important;
        --crimson-bright: ${colors.base} !important; 
      }
      .arabic-text { font-size: calc(1.8rem * ${themeState.scaleAr}) !important; }
      .english-text { font-size: calc(1.05rem * ${themeState.scaleEn}) !important; }
      @media (max-width: 768px) {
        .arabic-text { font-size: calc(1.4rem * ${themeState.scaleAr}) !important; }
        .english-text { font-size: calc(0.95rem * ${themeState.scaleEn}) !important; }
      }
    `;

    // Update color orbs
    document.querySelectorAll('.color-orb').forEach(orb => {
      orb.classList.toggle('active', orb.dataset.color === themeState.accent);
    });

    // 3. Transliteration
    const translitToggle = document.getElementById('translit-toggle');
    if (translitToggle) translitToggle.checked = themeState.translit;
    document.querySelectorAll('.transliteration-line').forEach(line => {
      line.style.display = themeState.translit ? 'block' : 'none';
      line.style.fontSize = `calc(0.95rem * ${themeState.scaleEn})`;
    });

    // Save to localStorage
    localStorage.setItem('maqtalThemeState', JSON.stringify(themeState));
  }

  // Load from localStorage
  const savedTheme = localStorage.getItem('maqtalThemeState');
  if (savedTheme) {
    try { themeState = { ...themeState, ...JSON.parse(savedTheme) }; } catch (e) {}
  } else {
    // If no saved theme, apply the Soft Minimalist theme automatically per user request!
    themeState.preset = 'minimal';
  }

  // Initialize UI controls to match loaded state
  const scaleArInput = document.getElementById('font-scale-ar');
  const scaleEnInput = document.getElementById('font-scale-en');
  if (scaleArInput) scaleArInput.value = themeState.scaleAr;
  if (scaleEnInput) scaleEnInput.value = themeState.scaleEn;

  // Event Listeners setup
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      themeState.preset = btn.dataset.theme;
      applyThemeState();
    });
  });

  document.querySelectorAll('.color-orb').forEach(orb => {
    orb.addEventListener('click', () => {
      themeState.accent = orb.dataset.color;
      applyThemeState();
    });
  });

  if (scaleArInput) {
    scaleArInput.addEventListener('input', (e) => {
      themeState.scaleAr = parseFloat(e.target.value);
      applyThemeState();
    });
  }

  if (scaleEnInput) {
    scaleEnInput.addEventListener('input', (e) => {
      themeState.scaleEn = parseFloat(e.target.value);
      applyThemeState();
    });
  }

  const translitToggle = document.getElementById('translit-toggle');
  if (translitToggle) {
    translitToggle.addEventListener('change', (e) => {
      themeState.translit = e.target.checked;
      applyThemeState();
    });
  }

  // Reset to Defaults
  const resetBtn = document.getElementById('theme-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Restore default values
      themeState = {
        preset: 'minimal', // as requested earlier
        accent: 'gold',
        scaleAr: 1,
        scaleEn: 1,
        translit: false
      };
      
      // Update Inputs visually
      if (scaleArInput) scaleArInput.value = 1;
      if (scaleEnInput) scaleEnInput.value = 1;
      if (translitToggle) translitToggle.checked = false;

      // Apply
      applyThemeState();
    });
  }

  // Initial Application
  applyThemeState();

  // --- 6. Social Sharing (Capture Quote) ---
  const shareBtns = document.querySelectorAll('.share-btn');
  shareBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      // Prevent propagating to parent clicks
      e.stopPropagation();
      
      const blockToShare = btn.closest('.text-block') || btn.closest('.poetry-block');
      if (!blockToShare) return;

      // Temporarily hide the share button itself and show full opacity for capture
      btn.style.display = 'none';
      const originalOpacity = blockToShare.style.opacity;
      const originalTransform = blockToShare.style.transform;
      
      blockToShare.style.opacity = '1';
      blockToShare.style.transform = 'none';

      try {
        // Use html2canvas to capture the block
        const canvas = await html2canvas(blockToShare, {
          backgroundColor: document.body.classList.contains('theme-minimal') ? '#ffffff' : (document.body.classList.contains('theme-parchment') ? '#e8e2cd' : '#030303'),
          scale: 2, // High resolution
          logging: false
        });

        // Convert canvas to image data URL
        const imgData = canvas.toDataURL('image/png');
        
        // Trigger download
        const a = document.createElement('a');
        a.href = imgData;
        a.download = 'maqtal_quote.png';
        a.click();
      } catch (err) {
        console.error('Failed to capture quote:', err);
        alert('Could not generate the image to share.');
      } finally {
        // Restore styles securely
        btn.style.display = '';
        blockToShare.style.opacity = originalOpacity;
        blockToShare.style.transform = originalTransform;
      }
    });
  });

});

// Global function for mobile menu (called from HTML onclick)
function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
}
