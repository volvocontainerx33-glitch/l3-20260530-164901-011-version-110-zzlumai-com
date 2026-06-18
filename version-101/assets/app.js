(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function textEscape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
      toggle.classList.toggle("open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./search.html?q=" + encodeURIComponent(query);
        } else {
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupHeroCarousel() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
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
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupHomeFilter() {
    var grid = document.querySelector("[data-home-grid]");
    var input = document.querySelector("[data-home-search]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-home-filter]"));
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var activeCategory = "all";
    function apply() {
      var query = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var category = card.getAttribute("data-home-category") || "";
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchCategory = activeCategory === "all" || category === activeCategory;
        card.hidden = !(matchQuery && matchCategory);
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCategory = chip.getAttribute("data-home-filter") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        apply();
      });
    });
  }

  function setupListFilters() {
    document.querySelectorAll("[data-list-filter]").forEach(function (input) {
      var selector = input.getAttribute("data-list-filter");
      var grid = selector ? document.querySelector(selector) : null;
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          card.hidden = query && text.indexOf(query) === -1;
        });
      });
    });
  }

  function cardMarkup(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
    var tagHtml = tags.map(function (tag) {
      return "<span>" + textEscape(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card compact-card\">" +
      "<a class=\"poster\" href=\"" + textEscape(movie.href) + "\" aria-label=\"" + textEscape(movie.title) + "\">" +
      "<img src=\"" + textEscape(movie.cover) + "\" alt=\"" + textEscape(movie.title) + "\" loading=\"lazy\">" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-meta\"><span>" + textEscape(movie.year) + "</span><span>" + textEscape(movie.region) + "</span><span>" + textEscape(movie.type) + "</span></div>" +
      "<h2><a href=\"" + textEscape(movie.href) + "\">" + textEscape(movie.title) + "</a></h2>" +
      "<p>" + textEscape(movie.one_line) + "</p>" +
      "<div class=\"tag-row\">" + tagHtml + "</div>" +
      "</div>" +
      "</article>";
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || typeof MOVIE_INDEX === "undefined") {
      return;
    }
    var form = page.querySelector("[data-search-page-form]");
    var input = page.querySelector("[data-search-page-input]");
    var results = page.querySelector("[data-search-results]");
    var status = page.querySelector("[data-search-status]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }
    function render(query) {
      var clean = normalize(query);
      var list = [];
      if (clean) {
        list = MOVIE_INDEX.filter(function (movie) {
          return normalize(movie.search).indexOf(clean) !== -1;
        }).slice(0, 160);
      } else {
        list = MOVIE_INDEX.slice(0, 36);
      }
      if (status) {
        status.textContent = clean ? (list.length ? "已为你筛选出相关影片" : "没有匹配的影片") : "热门影片推荐";
      }
      if (results) {
        results.innerHTML = list.map(cardMarkup).join("");
      }
    }
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render(input ? input.value : "");
      });
    }
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render(initial);
  }

  window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var attached = false;
    var playerInstance = null;
    if (!video || !button || !sourceUrl) {
      return;
    }
    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        playerInstance = new window.Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          enableWorker: true
        });
        playerInstance.loadSource(sourceUrl);
        playerInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      attached = true;
    }
    function play() {
      attach();
      button.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (playerInstance) {
        playerInstance.destroy();
      }
    });
  };

  onReady(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHeroCarousel();
    setupHomeFilter();
    setupListFilters();
    setupSearchPage();
  });
})();
