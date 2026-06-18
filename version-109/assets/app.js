(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var carousel = document.querySelector('.hero-carousel');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    var nextSlide = function () {
      showSlide(current + 1);
    };

    var startTimer = function () {
      window.clearInterval(timer);
      timer = window.setInterval(nextSlide, 5200);
    };

    var previous = carousel.querySelector('.hero-control.prev');
    var next = carousel.querySelector('.hero-control.next');

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    startTimer();
  }

  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get('q') || '';
  var filterScopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

  filterScopes.forEach(function (scope) {
    var root = scope.closest('main') || document;
    var input = scope.querySelector('.filter-input');
    var selects = Array.prototype.slice.call(scope.querySelectorAll('.filter-select'));
    var cards = Array.prototype.slice.call(root.querySelectorAll('.filter-targets .movie-card'));
    var empty = root.querySelector('.empty-state');

    if (!cards.length) {
      return;
    }

    if (input && queryValue) {
      input.value = queryValue;
    }

    var runFilter = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = selects[0] ? selects[0].value : '';
      var type = selects[1] ? selects[1].value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }

        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }

        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }

        card.classList.toggle('hidden', !ok);

        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    if (input) {
      input.addEventListener('input', runFilter);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', runFilter);
    });

    runFilter();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (frame) {
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('.play-overlay');
    var hlsInstance = null;
    var attached = false;

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');

    var hideOverlay = function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    };

    var attachStream = function () {
      if (!stream) {
        return Promise.reject(new Error('empty stream'));
      }

      if (attached) {
        return video.play();
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal || !hlsInstance) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        });

        return Promise.resolve();
      }

      video.src = stream;
      return video.play();
    };

    var play = function () {
      hideOverlay();
      attachStream().catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
          var label = overlay.querySelector('strong');
          if (label) {
            label.textContent = '重新播放';
          }
        }
      });
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('play', hideOverlay);

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
