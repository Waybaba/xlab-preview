(() => {
  const search = document.querySelector('.project-search');
  if (search) {
    const input = search.querySelector('input');
    const clear = search.querySelector('.search-clear');
    const cards = [...document.querySelectorAll('#research-grid [data-project]')];
    const count = document.querySelector('#research-count');
    const empty = document.querySelector('.search-empty');
    const filter = () => {
      const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let shown = 0;
      cards.forEach(card => {
        card.hidden = !terms.every(term => card.dataset.search.toLowerCase().includes(term));
        if (!card.hidden) shown++;
      });
      count.textContent = terms.length ? `${shown} of ${cards.length} research projects` : `${cards.length} research projects`;
      empty.hidden = shown > 0;
      clear.hidden = !input.value;
    };
    search.hidden = false;
    search.addEventListener('submit', event => event.preventDefault());
    input.addEventListener('input', filter);
    clear.addEventListener('click', () => { input.value = ''; filter(); input.focus(); });
  }
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.project-card').forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;
    let requested = false;
    const start = () => {
      if (motion.matches) return;
      requested = true;
      video.play().then(() => {
        if (requested) card.classList.add('is-previewing');
        else video.pause();
      }).catch(() => {});
    };
    const stop = () => { requested = false; card.classList.remove('is-previewing'); video.pause(); };
    card.addEventListener('mouseenter', start);
    card.addEventListener('mouseleave', stop);
    card.addEventListener('focus', start);
    card.addEventListener('blur', stop);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  });
  // Raw HTML headings may not have Kramdown IDs. Upgrade their outline labels.
  document.querySelectorAll('.project-outline [data-section-link]').forEach((link, index) => {
    const heading = [...document.querySelectorAll('.project-article h2')].find(h => h.textContent.trim() === link.textContent.trim());
    if (!heading) return;
    let id = heading.id || `project-section-${index + 1}`;
    while (!heading.id && document.getElementById(id)) id += '-section';
    heading.id = id;
    link.href = `#${id}`;
  });
  // Hide empty sections inherited from profile templates; retain source and IDs.
  document.querySelectorAll('.person-biography h2').forEach(heading => {
    let next = heading.nextElementSibling;
    while (next && !next.textContent.trim() && !next.matches('img,video,iframe') && !next.querySelector('img,video,iframe') && !/^H[12]$/.test(next.tagName)) next = next.nextElementSibling;
    if (!next || /^H[12]$/.test(next.tagName)) heading.hidden = true;
  });
})();
