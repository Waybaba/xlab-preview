(() => {
  const layout = document.querySelector('.roadmap-layout');
  const article = document.querySelector('.roadmap-article');
  const rail = document.querySelector('.roadmap-contents');
  if (!layout || !article || !rail) return;

  const details = rail.querySelector('details');
  const nav = rail.querySelector('nav');
  const list = rail.querySelector('ol');
  const stops = [...article.querySelectorAll('.rr-stop')];
  const car = article.querySelector('#rrCar');
  const mobile = matchMedia('(max-width: 1000px)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const destinations = [];
  const groups = new Map();

  const addLink = (parent, target, label, group = null) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${target.id}`;
    link.textContent = label;
    item.append(link);
    parent.append(item);
    destinations.push({ target, link, group });
    return item;
  };

  addLink(list, article, 'Overview');
  article.querySelectorAll('.thrust[id^="thrust-"]').forEach(section => {
    const heading = section.querySelector('h2');
    if (!heading) return;
    const stop = stops.find(button => button.dataset.target === section.id);
    const label = stop?.querySelector('.rr-stop-label')?.textContent.trim() || heading.textContent.trim();
    const item = addLink(list, section, `${section.id.slice(-1).toUpperCase()}. ${label}`, section.id);
    groups.set(section.id, item);
    const subheadings = [...section.querySelectorAll('h3[id]')];
    if (!subheadings.length) return;
    const children = document.createElement('ol');
    children.className = 'roadmap-contents-subsections';
    item.append(children);
    subheadings.forEach(heading => addLink(children, heading, heading.textContent.trim(), section.id));
  });
  [['roadmap-references', 'References'], ['roadmap-director', 'About the Director']].forEach(([id, label]) => {
    const target = document.getElementById(id);
    if (target) addLink(list, target, label);
  });

  rail.hidden = false;
  layout.classList.add('has-outline');
  const adapt = () => { details.open = !mobile.matches; };
  adapt();
  mobile.addEventListener('change', adapt);

  let current = null;
  let currentGroup = null;
  let frame = null;
  const moveCar = group => {
    if (!car || !stops.length) return;
    const index = Math.max(0, stops.findIndex(stop => stop.dataset.target === group));
    stops.forEach((stop, i) => {
      stop.classList.toggle('is-active', i === index);
      stop.setAttribute('aria-pressed', String(i === index));
    });
    car.style.left = `${stops[index].offsetLeft + stops[index].offsetWidth / 2}px`;
  };
  const update = () => {
    frame = null;
    let active = destinations[0];
    const readingLine = Math.min(200, window.innerHeight * 0.25);
    for (const entry of destinations) {
      if (entry.target.getBoundingClientRect().top <= readingLine) active = entry;
      else break;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) active = destinations.at(-1);
    if (active === current) return;
    if (current) {
      current.link.classList.remove('is-active');
      current.link.removeAttribute('aria-current');
    }
    active.link.classList.add('is-active');
    active.link.setAttribute('aria-current', 'location');
    groups.forEach((item, id) => item.classList.toggle('is-current-group', id === active.group));
    current = active;
    if (active.group !== currentGroup) {
      currentGroup = active.group;
      moveCar(currentGroup);
    }
    // Scroll only the contents rail, never the article, to keep its active row visible.
    if (details.open) {
      const bounds = nav.getBoundingClientRect();
      const row = active.link.getBoundingClientRect();
      if (row.top < bounds.top) nav.scrollTop += row.top - bounds.top;
      else if (row.bottom > bounds.bottom) nav.scrollTop += row.bottom - bounds.bottom;
    }
  };
  const schedule = () => { if (frame === null) frame = requestAnimationFrame(update); };
  nav.addEventListener('click', event => {
    if (event.target.closest('a') && mobile.matches) details.open = false;
  });
  stops.forEach(stop => stop.addEventListener('click', () => {
    const target = document.getElementById(stop.dataset.target);
    if (!target) return;
    target.scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'start' });
  }));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('hashchange', schedule);
  window.addEventListener('resize', () => { moveCar(currentGroup); schedule(); });
  window.addEventListener('load', schedule);
  moveCar(null);
  schedule();
})();
