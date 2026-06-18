(function() {
  window.setupMoviePlayer = function(url) {
    var box = document.querySelector("[data-player]");
    if (!box) {
      return;
    }

    var video = box.querySelector("video");
    var cover = box.querySelector("[data-player-cover]");
    var hls = null;
    var ready = false;

    function attach() {
      if (!video || ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }

      ready = true;
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video) {
        video.controls = true;
        var result = video.play();
        if (result && result.catch) {
          result.catch(function() {});
        }
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function() {
        if (video.paused) {
          play();
        }
      });
    }

    window.addEventListener("pagehide", function() {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };
})();
