function LoginCtrl($scope, $location) {
  $scope.login = function() {
    $location.path('select')
  }
};

/**
 *
 * @param $scope
 * @param $location
 * @constructor
 */
function SelectCtrl($scope, $location) {
  $scope.navigate = function(path) {
    $location.path(path);
  }
};





/**
 *
 * @param $scope
 * @param $routeParams
 * @constructor
 */
function PickMeCtrl($scope, $http) {
  navigator.geolocation.getCurrentPosition(angular.bind(this, this.initialize));
  this.map = null;
  this.geocoder = null;
  this.myLatlng = null;
  this.http = $http;
  this.scope = $scope;

  $scope.go = angular.bind(this, function() {
    this.geocoder.geocode( { 'address': $scope.destination, 'region': 'us'}, angular.bind(this, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        this.showDestination(results[0].geometry.location);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    }));
  });
};

PickMeCtrl.prototype.initialize = function(position) {
  this.geocoder = new google.maps.Geocoder();
  this.myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var mapOptions = {
    center: myLatlng,
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.map = new google.maps.Map($(".map-canvas").get(0), mapOptions);
  var myMarker = new google.maps.Marker({
    position: this.myLatlng,
    map: this.map,
    title: "I'm here"
  });
};

PickMeCtrl.prototype.showDestination = function(destination, $http) {
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(destination);
  bounds.extend(this.myLatlng);

  this.map.fitBounds(bounds);

  var destinationMarker = new google.maps.Marker({
    map: this.map,
    position: destination,
    title: "Destination"
  });


  this.http({method: 'GET', url: '/companion/pickMe',
    params: {
      username: 'Valera',
      from: latLngToJSON(this.myLatlng),
      to: latLngToJSON(destination),
      wt: this.scope.wt
    }});
};





/**
 *
 * @param $scope
 * @param $routeParams
 * @constructor
 */
function IAmDrivingCtrl($scope, $routeParams) {
};

function ListCtrl($scope, $routeParams) {
};


function latLngToJSON(ll) {
  return JSON.stringify({lat: ll.lat(), lon: ll.lng()});
};