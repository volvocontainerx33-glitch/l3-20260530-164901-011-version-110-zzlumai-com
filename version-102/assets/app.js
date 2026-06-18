(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
      button.textContent = expanded ? '☰' : '×';
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector('.hero-carousel');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = Number(dot.getAttribute('data-target-slide')) || 0;
        show(target);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupHeaderSearch() {
    var forms = document.querySelectorAll('.site-search');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = 'search.html';
        }
      });
    });
  }

  function setupLocalFilter() {
    var input = document.querySelector('.local-filter-input');
    var grid = document.querySelector('.filterable-grid');
    if (!input || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var empty = document.querySelector('.empty-state');

    input.addEventListener('input', function () {
      var term = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var match = !term || text.indexOf(term) !== -1;
        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    });
  }

  function setupSearchPage() {
    var input = document.getElementById('movie-search-input');
    var region = document.getElementById('region-filter');
    var type = document.getElementById('type-filter');
    var year = document.getElementById('year-filter');
    var grid = document.querySelector('.search-results');
    if (!input || !grid) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var count = document.getElementById('result-count');
    var reset = document.getElementById('reset-filters');
    var empty = document.querySelector('.empty-state');

    function applyFilters() {
      var term = normalize(input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var match = true;

        if (term && text.indexOf(term) === -1) {
          match = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          match = false;
        }
        if (typeValue && cardType !== typeValue) {
          match = false;
        }
        if (yearValue && cardYear !== yearValue) {
          match = false;
        }

        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, type, year].forEach(function (field) {
      if (field) {
        field.addEventListener('input', applyFilters);
        field.addEventListener('change', applyFilters);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        input.value = '';
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (year) {
          year.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  function setupPlayers() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (player) {
      var video = player.querySelector('.js-hls-player');
      var overlay = player.querySelector('.player-overlay-button');
      var message = player.querySelector('.player-message');
      if (!video) {
        return;
      }

      var src = video.getAttribute('data-src');
      var hlsInstance = null;

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.hidden = false;
      }

      if (src) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showMessage('视频加载失败，请刷新页面或稍后重试。');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          showMessage('当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge 或 Safari。');
        }
      }

      function playOrPause() {
        if (video.paused) {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              showMessage('浏览器阻止了自动播放，请再次点击播放器。');
            });
          }
        } else {
          video.pause();
        }
      }

      if (overlay) {
        overlay.addEventListener('click', playOrPause);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          playOrPause();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function setupPosterFallbacks() {
    var images = document.querySelectorAll('.poster-shell img');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var shell = image.closest('.poster-shell');
        if (shell) {
          shell.classList.add('poster-missing');
        }
      }, { once: true });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupHeaderSearch();
    setupLocalFilter();
    setupSearchPage();
    setupPlayers();
    setupPosterFallbacks();
  });
}());
