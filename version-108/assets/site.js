(function () {
  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (slides.length === 0) {
      return;
    }

    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(index);
        startTimer();
      });
    });

    startTimer();
  }

  function setupCardFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var keyword = normalizeText(input.value);
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

        cards.forEach(function (card) {
          var haystack = normalizeText(card.getAttribute("data-search"));
          card.classList.toggle("is-hidden", keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var data = window.MOVIE_SEARCH_DATA || [];

    if (!form || !input || !results || data.length === 0) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function cardTemplate(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span class=\"pill\">" + escapeHtml(tag) + "</span>";
      }).join("");

      return "<article class=\"movie-card\" data-card>" +
        "<a class=\"poster-link\" href=\"" + escapeAttribute(movie.page) + "\" aria-label=\"观看" + escapeAttribute(movie.title) + "\">" +
        "<img src=\"" + escapeAttribute(movie.cover) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"card-badge\">" + escapeHtml(movie.type) + "</span>" +
        "</a>" +
        "<div class=\"movie-card-body\">" +
        "<p class=\"meta-line\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.year) + " · " + escapeHtml(movie.category) + "</p>" +
        "<h3><a href=\"" + escapeAttribute(movie.page) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
        "<p class=\"line-clamp\">" + escapeHtml(movie.one_line) + "</p>" +
        "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
        "</article>";
    }

    function render(query) {
      var keyword = normalizeText(query);
      var matches = data.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return normalizeText(movie.search).indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (matches.length === 0) {
        results.innerHTML = "<div class=\"search-empty\">未找到匹配内容，请尝试更换关键词。</div>";
        return;
      }

      results.innerHTML = matches.map(cardTemplate).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = new URL(window.location.href);

      if (query) {
        url.searchParams.set("q", query);
      } else {
        url.searchParams.delete("q");
      }

      window.history.replaceState({}, "", url.toString());
      render(query);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initialQuery);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-src");

      if (!video || !button || !source) {
        return;
      }

      button.addEventListener("click", function () {
        player.classList.add("is-playing");
        video.controls = true;

        if (status) {
          status.textContent = "正在加载播放源";
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          playVideo(video, status);
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (video._hlsInstance) {
            video._hlsInstance.destroy();
          }

          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          video._hlsInstance = hls;
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo(video, status);
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (status && data && data.fatal) {
              status.textContent = "播放源加载失败，请刷新后重试";
              player.classList.remove("is-playing");
            }
          });
          return;
        }

        video.src = source;
        playVideo(video, status);
      });
    });
  }

  function playVideo(video, status) {
    var promise = video.play();

    if (promise && typeof promise.then === "function") {
      promise.then(function () {
        if (status) {
          status.textContent = "正在播放";
        }
      }).catch(function () {
        if (status) {
          status.textContent = "浏览器已阻止自动播放，请再次点击视频控制条播放";
        }
      });
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupCardFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
