var animatePoints = function() {
  
  var points = document.getElementsByClassName('point');
  
  var revealPoint = function(indexNumber) {
    points[indexNumber].style.opacity = 1;
    points[indexNumber].style.transform = "scaleX(1) translateY(0)";
    points[indexNumber].style.msTransform = "scaleX(1) translateY(0)";
    points[indexNumber].style.WebkitTransform = "scaleX(1) translateY(0)";
  }
  
  for(var i = 0; i < points.length; i++) {
    revealPoint(i);
  }
  
};

animatePoints();