var createSongRow = function(songNumber, songName, songLength) {
  var template =
    '<tr class="album-view-song-item">'
  + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
  + '  <td class="song-item-title">' + songName + '</td>'
  + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
  + '</tr>'
  ;

  var $row = $(template);

  var clickHandler = function() {
    var $songItem = $(this);
    var songNumber = parseInt($(this).attr('data-song-number'));

    updateSeekPercentage($('.volume .seek-bar'), currentVolume / 100);

    if(currentlyPlayingSongNumber === null) {
      $songItem.html(pauseButtonTemplate);
      setSong(songNumber);
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();
    } else if(currentlyPlayingSongNumber === songNumber) {
      if(currentSoundFile.isPaused()) {
        $songItem.html(pauseButtonTemplate);
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
      } else {
        currentSoundFile.pause();
        $songItem.html(playButtonTemplate);
      }
    } else if(currentlyPlayingSongNumber !== songNumber) {
      var $currentSongNumberElement = getSongNumberCell(currentlyPlayingSongNumber);
      $($currentSongNumberElement).html($($currentSongNumberElement).attr('data-song-number'));
      $songItem.html(pauseButtonTemplate);
      setSong(songNumber);
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();
    }

    updatePlayerBarSong();
  };

  var onHover = function(event) {
    if(parseInt($(this).find('.song-item-number').attr('data-song-number')) !== currentlyPlayingSongNumber) {
      $(this).find('.song-item-number').html(playButtonTemplate);
    }
  };

  var offHover = function(event) {
    var songItemNumber = parseInt($(this).find('.song-item-number').attr('data-song-number'));
    if(songItemNumber !== currentlyPlayingSongNumber) {
      $(this).find('.song-item-number').html(songItemNumber);
    }
  };

  $row.find('.song-item-number').click(clickHandler);
  $row.hover(onHover, offHover);
  return $row;
};

var setCurrentAlbum = function(album) {
  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  for (var i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($newRow);
  }
};

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

// Elements we'll be adding listeners to
var songListContainer = document.getElementsByClassName('album-view-song-list')[0];
var songRows = document.getElementsByClassName('album-view-song-item');

// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';


// Store state of playing songs
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
  $playPauseButton.click(togglePlayFromPlayerBar);
  setupSekBars();
});

var updatePlayerBarSong = function() {
  setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
  if (!currentSoundFile.isPaused()) {
    $('.song-name').html(currentSongFromAlbum.title);
    $('.artist-name').html(currentAlbum.artist);
    $('.artist-song-mobile').html(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
  } else {
    $('.song-name').empty();
    $('.artist-name').empty();
    $('.artist-song-mobile').empty();
    $('.main-controls .play-pause').html(playerBarPlayButton);
  }

};

var updateSeekBarWhileSongPlays = function() {
  if(currentSoundFile) {
    currentSoundFile.bind('timeupdate', function(event) {
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');

      updateSeekPercentage($seekBar, seekBarFillRatio);
      setCurrentTimeInPlayerBar(this.getTime());
    });
  }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);

  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var setupSekBars = function() {
  var $seekBars = $('.player-bar .seek-bar');

  $seekBars.click(function(event) {
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;

    updateSeekPercentage($(this), seekBarFillRatio);

    if($(this).parent().hasClass('seek-control')) {
      seek(seekBarFillRatio * currentSongFromAlbum.duration)
    } else {
      setVolume(seekBarFillRatio * 100);
    }
  });

  $seekBars.find('.thumb').mousedown(function(event) {
      var $seekBar = $(this).parent();

      $(document).bind('mousemove.thumb', function(event){
        var offsetX = event.pageX - $seekBar.offset().left;
        var barWidth = $seekBar.width();
        var seekBarFillRatio = offsetX / barWidth;

        updateSeekPercentage($seekBar, seekBarFillRatio);

        if($seekBar.parent().hasClass('seek-control')) {
          seek(seekBarFillRatio * currentSongFromAlbum.duration)
        } else {
          setVolume(seekBarFillRatio * 100);
        }
      });

      $(document).bind('mouseup.thumb', function() {
          $(document).unbind('mousemove.thumb');
          $(document).unbind('mouseup.thumb');
      });
  });
};

var nextSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  var $currentSongNumberElement = getSongNumberCell(currentSongIndex + 1);
  var lastSongIndex = currentAlbum.songs.length - 1;
  var nextSongIndex;

  if(currentSongIndex === null || currentSongIndex === lastSongIndex) {
    nextSongIndex = 0;
  } else {
    nextSongIndex = currentSongIndex + 1;
  }

  var $nextSongNumberElement = getSongNumberCell(nextSongIndex + 1);
  $($currentSongNumberElement).html($($currentSongNumberElement).attr('data-song-number'));
  $($nextSongNumberElement).html(pauseButtonTemplate);
  setSong(nextSongIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();
};

var previousSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  var $currentSongNumberElement = getSongNumberCell(currentSongIndex + 1);
  var lastSongIndex = currentAlbum.songs.length - 1;
  var previousSongIndex;

  if(currentSongIndex === null || currentSongIndex === 0) {
    previousSongIndex = lastSongIndex;
  } else {
    previousSongIndex = currentSongIndex - 1;
  }

  var $previousSongNumberElement = getSongNumberCell(previousSongIndex + 1);
  $($currentSongNumberElement).html($($currentSongNumberElement).attr('data-song-number'));
  $($previousSongNumberElement).html(pauseButtonTemplate);
  setSong(previousSongIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();
};

var togglePlayFromPlayerBar = function() {
  var $currentSongNumberElement = getSongNumberCell(currentlyPlayingSongNumber);
  if(currentSoundFile.isPaused()) {
    currentSoundFile.play();
    $($currentSongNumberElement).html(pauseButtonTemplate);
    $($playPauseButton).html(playerBarPauseButton);
  } else {
    currentSoundFile.pause();
    $($currentSongNumberElement).html(playButtonTemplate);
    $($playPauseButton).html(playerBarPlayButton);
  }
};

var setSong = function(songNumber) {
  if(currentSoundFile) {
    currentSoundFile.stop();
  }

  currentlyPlayingSongNumber =  parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: [ 'mp3' ],
    preload: true
  });

  setVolume(currentVolume);
};

var seek = function(time) {
  if(currentSoundFile) {
    currentSoundFile.setTime(time);
  }
};

var setVolume = function(volume) {
  if(currentSoundFile) {
    currentSoundFile.setVolume(volume);
  }
};

var getSongNumberCell = function(number) {
  return $('.song-item-number')[number - 1];
};

var setCurrentTimeInPlayerBar = function(currentTime) {
  $('.current-time').text(filterTimeCode(currentTime));
};

var setTotalTimeInPlayerBar = function(totalTime) {
  $('.total-time').text(filterTimeCode(totalTime));
};

var filterTimeCode = function(timeInSeconds) {
  var time = Math.floor(parseFloat(timeInSeconds));
  var minutes = Math.floor(time / 60);
  var seconds = time - (minutes * 60);
  if(seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ":" + seconds;
};