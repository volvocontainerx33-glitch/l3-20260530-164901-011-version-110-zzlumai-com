(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var forms = document.querySelectorAll('[data-site-search]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"], input[type="search"]');
      var value = input ? input.value.trim() : '';
      var target = './search.html';
      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5800);
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
      startHero();
    });
  });

  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var emptyState = document.querySelector('[data-empty-state]');
  var activeType = '';

  function normalize(text) {
    return String(text || '').toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var query = normalize(filterInput ? filterInput.value.trim() : '');
    var year = yearFilter ? yearFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchYear = !year || card.getAttribute('data-year') === year;
      var matchType = !activeType || card.getAttribute('data-type') === activeType;
      var ok = matchQuery && matchYear && matchType;
      card.classList.toggle('is-hidden-card', !ok);
      if (ok) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';
    if (queryValue) {
      filterInput.value = queryValue;
    }
    filterInput.addEventListener('input', applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }

  if (typeFilter) {
    typeFilter.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-type-value]');
      if (!button) {
        return;
      }
      activeType = button.getAttribute('data-type-value') || '';
      typeFilter.querySelectorAll('button').forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  }

  applyFilters();
})();
