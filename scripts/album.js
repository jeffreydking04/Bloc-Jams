var createSongRow = function(songNumber, songName, songLength) {
  var template =
    '<tr class="album-view-song-item">'
  + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
  + '  <td class="song-item-title">' + songName + '</td>'
  + '  <td class="song-item-duration">' + songLength + '</td>'
  + '</tr>'
  ;

  var $row = $(template);

  var clickHandler = function() {
    var $songItem = $(this);
    var songNumber = parseInt($(this).attr('data-song-number'));

    if(currentlyPlayingSongNumber === null) {
      $songItem.html(pauseButtonTemplate);
      currentlyPlayingSongNumber = parseInt(songNumber);
      currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    } else if(currentlyPlayingSongNumber === songNumber) {
      $songItem.html(playButtonTemplate);
      currentlyPlayingSongNumber = null;
      currentSongFromAlbum = null;
    } else if(currentlyPlayingSongNumber !== songNumber) {
      var $currentlyPlayingSong = $('[data-song-number="' + currentlyPlayingSongNumber +'"]');
      $currentlyPlayingSong.html($currentlyPlayingSong.attr('data-song-number'));
      $songItem.html(pauseButtonTemplate);
      currentlyPlayingSongNumber = parseInt(songNumber);
      currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
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
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
  setCurrentAlbum(albumMarconi);
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
});

var updatePlayerBarSong = function() {
  if (currentlyPlayingSongNumber !== null) {
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

var nextSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  var $currentSongNumberElement = $('.song-item-number')[currentSongIndex];
  var lastSongIndex = currentAlbum.songs.length - 1;
  var nextSongIndex;

  if(currentSongIndex === null || currentSongIndex === lastSongIndex) {
    nextSongIndex = 0;
  } else {
    nextSongIndex = currentSongIndex + 1;
  }

  var $nextSongNumberElement = $('.song-item-number')[nextSongIndex];
  $($currentSongNumberElement).html($($currentSongNumberElement).attr('data-song-number'));
  $($nextSongNumberElement).html(pauseButtonTemplate);
  currentSongFromAlbum = currentAlbum.songs[nextSongIndex];
  currentlyPlayingSongNumber = parseInt(nextSongIndex + 1);
  updatePlayerBarSong();
};

var previousSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  var $currentSongNumberElement = $('.song-item-number')[currentSongIndex];
  var lastSongIndex = currentAlbum.songs.length - 1;
  var previousSongIndex;

  if(currentSongIndex === null || currentSongIndex === 0) {
    previousSongIndex = lastSongIndex;
  } else {
    previousSongIndex = currentSongIndex - 1;
  }

  var $previousSongNumberElement = $('.song-item-number')[previousSongIndex];
  $($currentSongNumberElement).html($($currentSongNumberElement).attr('data-song-number'));
  $($previousSongNumberElement).html(pauseButtonTemplate);
  currentSongFromAlbum = currentAlbum.songs[previousSongIndex];
  currentlyPlayingSongNumber = parseInt(previousSongIndex + 1);
  updatePlayerBarSong();
};