import { H as Hls } from './hls-vendor-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
    const button = $('[data-menu-toggle]');
    const menu = $('[data-mobile-menu]');
    if (!button || !menu) {
        return;
    }
    button.addEventListener('click', () => {
        menu.classList.toggle('is-open');
        button.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
}

function initSearchForms() {
    $$('[data-search-form]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const query = input ? input.value.trim() : '';
            const target = query ? `search.html?q=${encodeURIComponent(query)}` : 'search.html';
            window.location.href = target;
        });
    });
}

function initFilter() {
    const input = $('#movie-filter');
    const grid = $('[data-filter-grid]');
    const count = $('[data-filter-count]');
    if (!input || !grid) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query && !input.value) {
        input.value = query;
    }

    const cards = $$('.movie-card, .list-card', grid);
    const applyFilter = () => {
        const keyword = input.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach((card) => {
            const haystack = card.dataset.searchText || card.textContent.toLowerCase();
            const matched = !keyword || haystack.includes(keyword);
            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });
        if (count) {
            count.textContent = `${visible} 部影片`;
        }
    };

    input.addEventListener('input', applyFilter);
    applyFilter();
}

function initHero() {
    const slides = $$('[data-hero-slide]');
    const thumbs = $$('[data-hero-target]');
    if (slides.length === 0) {
        return;
    }

    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, itemIndex) => {
            slide.classList.toggle('is-active', itemIndex === index);
        });
        thumbs.forEach((thumb, itemIndex) => {
            thumb.classList.toggle('is-active', itemIndex === index);
        });
    };

    const restart = () => {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(() => show(index + 1), 6200);
    };

    $('[data-hero-prev]')?.addEventListener('click', () => {
        show(index - 1);
        restart();
    });

    $('[data-hero-next]')?.addEventListener('click', () => {
        show(index + 1);
        restart();
    });

    thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
            show(Number(thumb.dataset.heroTarget || 0));
            restart();
        });
    });

    restart();
}

function startVideo(player) {
    const video = $('video[data-src]', player);
    const overlay = $('[data-play-trigger].player-overlay', player);
    if (!video) {
        return;
    }

    const source = video.dataset.src;
    if (!source) {
        return;
    }

    if (!video.dataset.loaded) {
        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        }
        video.dataset.loaded = 'true';
    }

    if (overlay) {
        overlay.classList.add('is-hidden');
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
            video.controls = true;
        });
    }
}

function initPlayers() {
    $$('[data-player]').forEach((player) => {
        $$('[data-play-trigger]', player).forEach((trigger) => {
            trigger.addEventListener('click', () => startVideo(player));
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSearchForms();
    initFilter();
    initHero();
    initPlayers();
});
