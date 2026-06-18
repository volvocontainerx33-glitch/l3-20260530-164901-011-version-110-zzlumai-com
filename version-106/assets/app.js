
import { H as Hls } from './hls-vendor.js';

const qs = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function initNav() {
  const header = document.querySelector('.header');
  const toggle = document.querySelector('[data-nav-toggle]');
  if (!header || !toggle) return;
  toggle.addEventListener('click', () => header.classList.toggle('nav-open'));
}

function matchCard(card, q) {
  if (!q) return true;
  const hay = [
    card.dataset.title,
    card.dataset.genre,
    card.dataset.region,
    card.dataset.year,
    card.dataset.tags,
    card.dataset.type,
  ].join(' ').toLowerCase();
  return hay.includes(q);
}

function initSearch() {
  const input = document.querySelector('[data-search-input]');
  const chips = qs('[data-filter-type]');
  const cards = qs('[data-card]');
  if (!input || !cards.length) return;
  let active = '';
  function apply() {
    const q = (input.value || '').trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const ok = matchCard(card, q) && (!active || card.dataset.type === active);
      card.hidden = !ok;
      if (ok) shown += 1;
    });
    const count = document.querySelector('[data-result-count]');
    if (count) count.textContent = String(shown);
  }
  input.addEventListener('input', apply);
  chips.forEach(chip => chip.addEventListener('click', () => {
    active = chip.dataset.filterChip || '';
    chips.forEach(c => c.classList.toggle('active', c === chip));
    apply();
  }));
  apply();
}

function initHero() {
  const track = document.querySelector('[data-hero-track]');
  const slides = track ? qs('.hero-slide', track) : [];
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  if (!track || slides.length < 2) return;
  let index = 0;
  const go = (n) => {
    index = (n + slides.length) % slides.length;
    track.style.transform = `translateX(${-index * 100}%)`;
  };
  prev && prev.addEventListener('click', () => go(index - 1));
  next && next.addEventListener('click', () => go(index + 1));
  setInterval(() => go(index + 1), 6500);
}

function initPlayer() {
  const video = document.querySelector('video[data-play-src]');
  if (!video) return;
  const overlay = document.querySelector('[data-play-overlay]');
  const src = video.dataset.playSrc;
  const hlsSrc = video.dataset.playHls;
  const startPlayback = () => {
    overlay && overlay.classList.add('hidden');
    video.play().catch(()=>{});
  };
  const setNative = (url) => {
    if (!url) return;
    video.src = url;
    video.load();
  };
  const canNativeHls = video.canPlayType('application/vnd.apple.mpegurl');
  if (hlsSrc && Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
    });
    hls.loadSource(hlsSrc);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, function (_, data) {
      if (data && data.fatal) {
        hls.destroy();
        setNative(src);
      }
    });
  } else if (hlsSrc && canNativeHls) {
    setNative(hlsSrc);
  } else {
    setNative(src);
  }
  overlay && overlay.addEventListener('click', startPlayback);
  video.addEventListener('play', () => overlay && overlay.classList.add('hidden'));
  video.addEventListener('pause', () => overlay && overlay.classList.remove('hidden'));
}

function initBackTop() {
  const btn = document.querySelector('[data-back-top]');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.hidden = window.scrollY < 400;
  }, {passive:true});
  btn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSearch();
  initHero();
  initPlayer();
  initBackTop();
});
