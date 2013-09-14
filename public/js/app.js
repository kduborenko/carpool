
function getLocation()
{
  if (navigator.geolocation)
  {
    navigator.geolocation.getCurrentPosition(initialize);
  }
}

function initialize(position) {
  var mapOptions = {
    center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);
}

google.maps.event.addDomListener(window, 'load', getLocation);
