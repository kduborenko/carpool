angular.module('carpool', []).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/login', {templateUrl: 'partials/login.html',   controller: LoginCtrl}).
      when('/select', {templateUrl: 'partials/select.html', controller: SelectCtrl}).
      when('/pick-me', {templateUrl: 'partials/pick-me.html', controller: PickMeCtrl}).
      when('/i-am-driving', {templateUrl: 'partials/i-am-driving.html', controller: IAmDrivingCtrl}).
      when('/list', {templateUrl: 'partials/list.html', controller: ListCtrl}).
      otherwise({redirectTo: '/login'});
}]);



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
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var passengers = [{id: 1, name: 'first', lat: 37.3830023, lng: -122.29147810000002},
  {id: 2, name: 'second', lat: 37.5538803, lng: -122.3936142}];

var directionsServiceRequest = {
  origin: null,
  destination: null,
  waypoints: [],
  optimizeWaypoints: true,
  travelMode: google.maps.DirectionsTravelMode.DRIVING
};

function initialize(position) {
  geocoder = new google.maps.Geocoder();
  myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  directionsDisplay = new google.maps.DirectionsRenderer();
  var mapOptions = {
    center: myLatlng,
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map($(".map-canvas:visible").get(0), mapOptions);
  var marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    title: "I'm here"
  });
  directionsDisplay.setMap(map);
}

function getPassengers(route, callback) {
  callback(passengers);
};

function calcRoute(start, end) {
  directionsServiceRequest.origin = start || directionsServiceRequest.origin;
  directionsServiceRequest.destination = end || directionsServiceRequest.destination;

  directionsService.route(directionsServiceRequest, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);

      // For each route, display summary information.
      var route = response.routes[0].legs[0];
      var steps = '';
      for (var i = 0; i < route.steps.length; i++) {
        steps += route.steps[i].start_point;
      }
      console.log(steps);

      if (start) {
        getPassengers(route, function(pas) {
          var pas = passengers;

          for (var i = 0; i < pas.length; i++) {
            showCoordInfoWindow(pas[i])
          }
        });
      }
    }
  });
};

var coordInfoWindows = 0;

function showCoordInfoWindow(pas) {
  var latLng = new google.maps.LatLng(pas.lat, pas.lng);
  var templ = $('#' + pas.name).get(0);
  var marker;
  var coordInfoWindow = new google.maps.InfoWindow();
  coordInfoWindow.setContent(templ);
  coordInfoWindow.setPosition(latLng);
  coordInfoWindow.open(map);
  coordInfoWindows++;
  coordInfoWindow.addListener('closeclick', function() {coordInfoWindows--; coordInfoWindow.close()});
  $('.btn-success', templ).on('click', function() {
    directionsServiceRequest.waypoints.push({location: latLng});
    marker = new google.maps.Marker({
      position: latLng,
      map: map,
      title: pas.name
    });
    coordInfoWindows--;
    coordInfoWindow.close();
    if (coordInfoWindows == 0) {
      calcRoute();
    }
  });
  $('.btn-danger', templ).on('click', function() {
    coordInfoWindows--;
    coordInfoWindow.close();
    if (coordInfoWindows == 0) {
      calcRoute();
    }
  });
};

$(function () {
  return;
//  if ($('#pick-me').isShown()) {
    google.maps.event.addDomListener(window, 'load', getLocation);

    $('.search-place').on('submit', function() {
      var address = $('.search-place-text:visible').val();
      geocoder.geocode( { 'address': address, 'region': 'us'}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var foundedLocation = results[0].geometry.location;
          var bounds = new google.maps.LatLngBounds();
          bounds.extend(foundedLocation);
          bounds.extend(myLatlng);

          map.fitBounds(bounds);

          var marker = new google.maps.Marker({
            map: map,
            position: foundedLocation
          });

          calcRoute(myLatlng, foundedLocation);
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
