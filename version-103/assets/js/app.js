(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function() {
        menu.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function(slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function() {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function() {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function() {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
          show(index);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-search-panel]").forEach(function(panel) {
      var scopeName = panel.getAttribute("data-scope");
      var scope = document.querySelector('[data-card-scope="' + scopeName + '"]') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty]");
      var keyword = panel.querySelector("[data-search-input]");
      var region = panel.querySelector("[data-region-filter]");
      var type = panel.querySelector("[data-type-filter]");
      var year = panel.querySelector("[data-year-filter]");

      function read(el) {
        return el ? el.value.trim().toLowerCase() : "";
      }

      function apply() {
        var q = read(keyword);
        var selectedRegion = read(region);
        var selectedType = read(type);
        var selectedYear = read(year);
        var visible = 0;

        cards.forEach(function(card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var matchesKeyword = !q || text.indexOf(q) !== -1;
          var matchesRegion = !selectedRegion || String(card.getAttribute("data-region")).toLowerCase() === selectedRegion;
          var matchesType = !selectedType || String(card.getAttribute("data-type")).toLowerCase() === selectedType;
          var matchesYear = !selectedYear || String(card.getAttribute("data-year")).toLowerCase() === selectedYear;
          var isVisible = matchesKeyword && matchesRegion && matchesType && matchesYear;
          card.hidden = !isVisible;
          if (isVisible) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [keyword, region, type, year].forEach(function(el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    });
  });
})();
