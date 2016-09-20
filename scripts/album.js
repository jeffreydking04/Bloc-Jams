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
      setSong(songNumber);
    } else if(currentlyPlayingSongNumber === songNumber) {
      $songItem.html(playButtonTemplate);
      currentlyPlayingSongNumber = null;
      currentSongFromAlbum = null;
    } else if(currentlyPlayingSongNumber !== songNumber) {
      var $currentSongNumberElement = getSongNumberCell(currentlyPlayingSongNumber);
      $($currentSongNumberElement).html($($currentSongNumberElement).attr('data-song-number'));
      $songItem.html(pauseButtonTemplate);
      setSong(songNumber);
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
  $previousButton.click(function() {
    adjacentSong("previous");
  });
  $nextButton.click(function() {
    adjacentSong("next");
  });
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

var adjacentSong = function(direction) {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  var $currentSongNumberElement = getSongNumberCell(currentSongIndex + 1);
  var lastSongIndex = currentAlbum.songs.length - 1;
  var adjacentSongIndex;

  if(direction === "next") {
    if(currentSongIndex === -1 || currentSongIndex === lastSongIndex) {
      adjacentSongIndex = 0;
    } else {
      adjacentSongIndex = currentSongIndex + 1;
    }
  } else if(direction === "previous") {
    if(currentSongIndex === -1 || currentSongIndex === 0) {
      adjacentSongIndex = lastSongIndex;
    } else {
      adjacentSongIndex = currentSongIndex - 1;
    }
  }

  var $nextSongNumberElement = getSongNumberCell(adjacentSongIndex + 1);
  $($currentSongNumberElement).html($($currentSongNumberElement).attr('data-song-number'));
  $($nextSongNumberElement).html(pauseButtonTemplate);
  setSong(adjacentSongIndex + 1);
  updatePlayerBarSong();
};

var setSong = function(songNumber) {
  currentlyPlayingSongNumber =  parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
};

var getSongNumberCell = function(number) {
  return $('.song-item-number')[number - 1];
};