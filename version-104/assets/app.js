(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length === 0) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var scope = input.closest("main") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-list] .movie-card, [data-filter-list] .rank-item"));
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]"));
      var resets = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-reset]"));

      function apply(value) {
        var query = normalize(value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" "));
          card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
        });
      }

      input.addEventListener("input", function () {
        apply(input.value);
        chips.forEach(function (chip) {
          chip.classList.toggle("active", normalize(chip.getAttribute("data-filter-chip")) === normalize(input.value));
        });
      });

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          input.value = chip.getAttribute("data-filter-chip") || "";
          input.dispatchEvent(new Event("input"));
        });
      });

      resets.forEach(function (reset) {
        reset.addEventListener("click", function () {
          input.value = "";
          input.dispatchEvent(new Event("input"));
        });
      });
    });
  }

  function readQuery() {
    var input = document.querySelector("[data-query-input]");
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      input.value = q;
      input.dispatchEvent(new Event("input"));
    }
  }

  function attachNativeToggle(video, overlay) {
    video.addEventListener("click", function () {
      if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("hidden");
      }
    });
  }

  function bootPlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }
    var hls = null;
    var loaded = false;

    function load() {
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }
      button.classList.add("hidden");
      video.play().catch(function () {
        button.classList.remove("hidden");
      });
    }

    button.addEventListener("click", load);
    video.addEventListener("loadedmetadata", function () {
      if (loaded) {
        button.classList.add("hidden");
      }
    });
    video.addEventListener("ended", function () {
      button.classList.remove("hidden");
    });
    attachNativeToggle(video, button);
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.MovieSite = {
    bootPlayer: bootPlayer
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    readQuery();
  });
}());
