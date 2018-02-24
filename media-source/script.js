
function log(wrap, text) {
  var $wrap = $(wrap);
  var logEl = document.createElement('P');
  logEl.innerText = text + ' ...';
  logEl.className = 'log-item';
  $wrap.append(logEl)
}

function playMp4() {
  var videoMp4 = document.querySelector('.js-player-mp4');
  log('.js-log-mp4', 'Get Video Element')
  if (window.MediaSource) {
    var mediaSource = new MediaSource();
    videoMp4.src = URL.createObjectURL(mediaSource);
    log('.js-log-mp4', 'Open Media Source')
    mediaSource.addEventListener('sourceopen', sourceOpen);
  } else {
  console.log("The Media Source Extensions API is not supported.")
  }

  function sourceOpen(e) {
    URL.revokeObjectURL(videoMp4.src);
    var mime = 'video/webm; codecs="vorbis, vp8"';
    var mediaSource = e.target;
    var sourceBuffer = mediaSource.addSourceBuffer(mime);
    var videoUrl = './video/avegers3.webm';
    log('.js-log-mp4', 'Fetch "./video/avegers3.webm"')
    fetch(videoUrl)
      .then(function(response) {
        log('.js-log-mp4', 'Finish "./video/avegers3.webm" Load')
        return response.arrayBuffer();
      })
      .then(function(arrayBuffer) {
      sourceBuffer.addEventListener('updateend', function(e) {
        log('.js-log-mp4', 'Update Media Source Buffer')
        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
          log('.js-log-mp4', 'End Media Source Buffer')
          mediaSource.endOfStream();
          videoMp4.play().then(function() {
            log('.js-log-mp4', 'Playing Video')
            $('.js-log-mp4').addClass('fadeout');
          }).catch(function(err) {
            log('.js-log-mp4', err)
          });
        }
      });
      sourceBuffer.appendBuffer(arrayBuffer);
      });
  }
}

// playMp4()

function playSegment() {
  var video = document.querySelector('video');
  var sourceBuffer;
  if (window.MediaSource) {
    var mediaSource = new MediaSource();
    video.src = URL.createObjectURL(mediaSource);
    mediaSource.addEventListener('sourceopen', sourceOpen, { once: true });
  } else {
    console.log("The Media Source Extensions API is not supported.")
  }
  var index = 0;
  function sourceOpen(e) {
    URL.revokeObjectURL(video.src);
    // var mime = 'video/mp4; codecs="avc1.42c015, mp4a.40.5"';avc1.42001e"
    var mime = 'video/mp4; codecs="avc1.42c01e"';
    var mediaSource = e.target;
    sourceBuffer = mediaSource.addSourceBuffer(mime);
    var videoUrl = 'index0.ts';
    fetch(videoUrl, {
       // headers: { range: 'bytes=0-5671398' }
    })
    .then(function(response) {
      return response.arrayBuffer();
    })
    .then(function(arrayBuffer) {
  
      sourceBuffer.appendBuffer(arrayBuffer);
      sourceBuffer.addEventListener('updateend', updateEnd);
      video.play();
    });
  }
  function updateEnd() {
      if (index + 1 > 1) {
        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
          console.log(10);
          mediaSource.endOfStream();
        }
        return;
      }
     // Video is now ready to play!
  
     //var bufferedSeconds = video.buffered.end(0) - video.buffered.start(0);
     // console.log(bufferedSeconds + ' seconds of video are ready to play!');
     // Fetch the next segment of video when user starts playing the video.
     fetchNextSegment();
   }
   function fetchNextSegment() {
    const url = 'index' + (index += 1) + '.ts';
    fetch(url, { headers: { } })
    .then(response => response.arrayBuffer())
    .then(data => {
      const sourceBuffer = mediaSource.sourceBuffers[0];
      sourceBuffer.appendBuffer(data);
    });
  }
  function sourceClose() {
      console.log('close MSE!');
  }
}

$(document).ready(function() {
  $('.js-play-mp4').on('click', function() {
    playMp4();
    $(this).hide();
    $('.js-log-mp4').addClass('active')
  })
})

