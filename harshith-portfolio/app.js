// Page behaviour. Everything here is progressive enhancement: the content and
// navigation work without it.
(() => {
  const root = document.documentElement;
  root.classList.add('js');

  // The inline controller owns the entrance, keyboard bypass and independent deadline.

  // One preference controls every continuous animation, including a failed-WebGL page.
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  try { userPaused = sessionStorage.getItem('hg-motion-paused') === '1'; } catch (_) {}
  let motionPlaying = !reduceMotion.matches && !userPaused;
  let sceneController = null;
  const motionButtons = [...document.querySelectorAll('#global-motion, #motion-toggle')];
  const globalMotion = document.getElementById('global-motion');
  const backdrops = [];

  function updateBackgrounds() {
    for (const item of backdrops) {
      const active = motionPlaying && item.visible && !document.hidden && !root.classList.contains('booting');
      if (active) item.svg.unpauseAnimations();
      else item.svg.pauseAnimations();
    }
  }

  function setMotion(playing) {
    motionPlaying = playing;
    root.classList.toggle('motion-enabled', playing);
    for (const button of motionButtons) {
      const label = playing ? 'Pause motion' : 'Resume motion';
      button.setAttribute('aria-label', label);
      button.title = label;
      button.classList.toggle('is-paused', !playing);
      const text = button.querySelector('span');
      if (text) text.textContent = label;
    }
    sceneController?.setPlaying(playing && !root.classList.contains('booting'));
    updateBackgrounds();
  }

  for (const button of motionButtons) {
    button.addEventListener('click', () => {
      userPaused = motionPlaying;
      try { sessionStorage.setItem('hg-motion-paused', userPaused ? '1' : '0'); } catch (_) {}
      setMotion(!motionPlaying);
    });
  }
  globalMotion.hidden = false;
  const onMotionPreference = () => setMotion(!reduceMotion.matches && !userPaused);
  reduceMotion.addEventListener('change', onMotionPreference);
  setMotion(motionPlaying);

  // A few SVG process routes, with native motion along paths (no extra WebGL renderer).
  // All animations start paused; only a visible section can resume its own SVG timeline.
  const routes = [
    'M-40 95H735Q775 95 775 135V195Q775 235 815 235H1480',
    'M610-30V48Q610 80 642 80H1250Q1290 80 1290 120V490Q1290 530 1330 530H1480',
    'M-40 610H325Q365 610 365 650V690Q365 730 405 730H1480',
  ];
  document.querySelectorAll('[data-backdrop]').forEach((container, index) => {
    const id = `flow-${index}`;
    container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800" preserveAspectRatio="none" focusable="false" aria-hidden="true">
      <path class="flow-reference" d="M950 0V800M1400 0V800M0 180H1440M0 680H1440"/>
      ${routes.map((route, i) => `<g class="${i === 1 ? 'flow-secondary' : ''}">
        <path id="${id}-${i}" class="flow-route ${i === 1 ? 'route-quality' : ''}" d="${route}"/>
        <circle class="flow-token ${i === 1 ? 'token-quality' : ''}" r="3.5"><animateMotion dur="${20 + i * 5}s" begin="indefinite" repeatCount="indefinite"><mpath href="#${id}-${i}"/></animateMotion></circle>
      </g>`).join('')}
      <g class="flow-station"><rect x="771" y="151" width="8" height="8" rx="1"/><rect x="946" y="231" width="8" height="8" rx="1"/><rect x="1136" y="726" width="8" height="8" rx="1"/></g>
      <g class="flow-station station-quality flow-secondary"><circle cx="1290" cy="365" r="5"/><circle cx="950" cy="80" r="5"/></g>
    </svg>`;
    const svg = container.querySelector('svg');
    if (typeof svg.pauseAnimations !== 'function') return;
    svg.pauseAnimations();
    svg.querySelectorAll('animateMotion').forEach((animation) => animation.beginElement());
    svg.setCurrentTime(7 + index * 4);
    backdrops.push({ container, svg, visible: false });
  });
  const backgroundObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const item = backdrops.find((item) => item.container === entry.target);
      if (item) item.visible = entry.isIntersecting;
    }
    updateBackgrounds();
  });
  backdrops.forEach((item) => backgroundObserver.observe(item.container));
  document.addEventListener('visibilitychange', updateBackgrounds);
  window.addEventListener('portfolio-ready', () => setMotion(motionPlaying));

  // Mobile navigation
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const mobileNav = window.matchMedia('(max-width: 860px)');
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  function setMenu(open, { returnFocus = false } = {}) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    header.classList.toggle('menu-open', open);
    if (!open && returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => setMenu(!isOpen()));
  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    if (mobileNav.matches && isOpen()) {
      // Do not strand keyboard focus inside a menu that has just become hidden.
      const destination = document.getElementById(link.hash.slice(1));
      if (destination) {
        destination.tabIndex = -1;
        destination.focus({ preventScroll: true });
      }
    }
    setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setMenu(false, { returnFocus: nav.contains(document.activeElement) || document.activeElement === toggle });
    }
  });
  document.addEventListener('click', (event) => {
    if (isOpen() && !header.contains(event.target)) setMenu(false);
  });
  mobileNav.addEventListener('change', () => {
    const focusInNav = nav.contains(document.activeElement);
    setMenu(false);
    if (mobileNav.matches && focusInNav) toggle.focus();
  });

  // Reading progress and current section in the navigation
  const progress = document.querySelector('.reading-progress');
  let progressQueued = false;
  const drawProgress = () => {
    progressQueued = false;
    const max = root.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  window.addEventListener('scroll', () => {
    if (!progressQueued) {
      progressQueued = true;
      requestAnimationFrame(drawProgress);
    }
  }, { passive: true });
  drawProgress();
  window.addEventListener('resize', drawProgress);

  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const sectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of navLinks) {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      }
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main > section[id]').forEach((section) => sectionObserver.observe(section));

  // DMAIC tabs: activation on click, roving focus with arrows/Home/End.
  const tabs = [...document.querySelectorAll('.method-tabs [role="tab"]')];
  function selectTab(tab, focus) {
    for (const t of tabs) {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    }
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab, false));
    tab.addEventListener('keydown', (event) => {
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      selectTab(tabs[(next + tabs.length) % tabs.length], true);
    });
  });
  if (tabs.length) selectTab(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0], false);

  // Project diagrams draw once when they enter the viewport.
  const diagramObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-drawn');
      diagramObserver.unobserve(entry.target);
    }
  }, { threshold: 0.35 });
  document.querySelectorAll('.project-visual').forEach((el) => diagramObserver.observe(el));

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Hero scene. The SVG fallback stays in place unless the first WebGL frame renders.
  const viewport = document.getElementById('scene-viewport');
  const controls = document.querySelector('.scene-controls');
  const rotateButton = document.getElementById('rotate-scene');

  const scene = import('./scene.js').then(({ createScene }) => new Promise((resolve) => {
    const controller = createScene(viewport, {
      onReady: () => resolve(controller),
      initialPlaying: motionPlaying && !root.classList.contains('booting'),
      motionManaged: true,
    });
  }));

  scene.then((controller) => {
    sceneController = controller;
    setMotion(motionPlaying);
    controls.hidden = false;
    rotateButton.addEventListener('click', () => controller.rotate());
    document.fonts?.ready.then(() => controller.refreshLabels());
  }).catch((error) => {
    viewport.classList.add('scene-failed');
    console.info('Hero scene unavailable; showing the static illustration.', error?.message || error);
  });

  // Preserve a back/forward cached page; stop its motion until it is visible again.
  window.addEventListener('pagehide', (event) => {
    backdrops.forEach(({ svg }) => svg.pauseAnimations());
    sceneController?.setPlaying(false);
    if (!event.persisted) {
      backgroundObserver.disconnect();
      sectionObserver.disconnect();
      diagramObserver.disconnect();
      reduceMotion.removeEventListener('change', onMotionPreference);
      document.removeEventListener('visibilitychange', updateBackgrounds);
      sceneController?.dispose();
    }
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) setMotion(motionPlaying);
  });
})();
