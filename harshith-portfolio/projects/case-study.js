// Reading controls are an enhancement; the contents links work without JavaScript.
(() => {
  const links = [...document.querySelectorAll('.case-toc a')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  const progress = document.querySelector('.reading-progress');
  let queued = false;
  const update = () => {
    queued = false;
    const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) + 100;
    const current = sections.filter(section => section.getBoundingClientRect().top <= top + 24).at(-1);
    for (const link of links) {
      if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    const range = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${range > 0 ? Math.min(1, scrollY / range) : 0})`;
  };
  const schedule = () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  };
  document.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  links.forEach(link => link.addEventListener('click', () => {
    const section = document.querySelector(link.hash);
    if (section) { section.tabIndex = -1; section.focus({ preventScroll: true }); }
  }));
  update();
})();
