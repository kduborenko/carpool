
function getLocation()
{
  if (navigator.geolocation)
  {
    navigator.geolocation.getCurrentPosition(initialize);
  }
}
var map = null;
var geocoder = null;
var myLatlng = null;

function initialize(position) {
  geocoder = new google.maps.Geocoder();
  myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var mapOptions = {
    center: myLatlng,
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);
  var marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    title: "I'm here"
  });
}


$(function () {
//  if ($('#pick-me').isShown()) {
    google.maps.event.addDomListener(window, 'load', getLocation);

    $('#search-place').on('submit', function() {
      var address = $('#search-place-text').val();
      geocoder.geocode( { 'address': address, 'region': 'us'}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var bounds = new google.maps.LatLngBounds();
          bounds.extend(results[0].geometry.location);
          bounds.extend(myLatlng);

          map.fitBounds(bounds);

          var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
          });
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
      return false;
    });


    $('#set-timeout').on('submit', function() {

      alert('Waiting for drivers');
      return false;
    });
//  }
});
