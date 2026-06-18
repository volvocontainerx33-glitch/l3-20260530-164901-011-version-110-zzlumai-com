(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.movie-video'));

  function attach(video) {
    var source = video.getAttribute('data-play');
    if (!source) {
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.getAttribute('src') !== source) {
        video.setAttribute('src', source);
      }
      return video.play();
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsItem) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsItem = hls;
      }
      return video.play();
    }

    if (video.getAttribute('src') !== source) {
      video.setAttribute('src', source);
    }
    return video.play();
  }

  players.forEach(function (video) {
    var frame = video.closest('.video-frame');
    var mask = frame ? frame.querySelector('.play-mask') : null;

    function start() {
      attach(video).then(function () {
        if (mask) {
          mask.classList.add('is-hidden');
        }
      }).catch(function () {
        if (mask) {
          mask.classList.add('is-hidden');
        }
      });
    }

    if (mask) {
      mask.addEventListener('click', start);
    }

    video.addEventListener('play', function () {
      if (mask) {
        mask.classList.add('is-hidden');
      }
    });

    video.addEventListener('click', function () {
      if (!video.currentSrc) {
        start();
      }
    });
  });
})();
