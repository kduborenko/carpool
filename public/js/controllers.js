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
  this.destination = null;
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

  $scope.wait = angular.bind(this, function() {
    $http({method: 'GET', url: '/companion/pickMe',
      params: {
        username: 'Valera',
        from: latLngToJSON(this.myLatlng),
        to: latLngToJSON(this.destination)
        // wt: this.scope.wt
      }}).success(angular.bind(this, this.waitForDriver, $http));
  })
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

PickMeCtrl.prototype.showDestination = function(destination) {
  this.destination = destination;
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(this.destination);
  bounds.extend(this.myLatlng);

  this.map.fitBounds(bounds);

  var destinationMarker = new google.maps.Marker({
    map: this.map,
    position: destination,
    title: "Destination"
  });
};

PickMeCtrl.prototype.waitForDriver = function($http, data) {
  if (data.status == 'ok') {
    this.userId = data.id;
  }
  jQuery("#wait-modal").modal();
  this.timer = setInterval(angular.bind(this, this.timeout, $http), 1000);
};

PickMeCtrl.prototype.timeout = function($http) {
  $http({method: 'GET', url: '/companion/get/' + this.userId}).
      success(function(data) {
        if (data.routesProposals) {
          this.showDriver(data.routesProposals);
        }
      });
};

PickMeCtrl.prototype.routesProposals = function(route) {
  clearInterval(this.timeout);
};




/**
 *
 * @param $scope
 * @param $routeParams
 * @constructor
 */
function IAmDrivingCtrl($scope, $http) {
  navigator.geolocation.getCurrentPosition(angular.bind(this, this.initialize));
  this.map = null;
  this.geocoder = null;
  this.myLatlng = null;
  this.destination = null;
  this.myMarker = null;
  this.directionsDisplay;
  this.directionsService = new google.maps.DirectionsService();
  this.directionsServiceRequestOptions = {
    origin: null,
    destination: null,
    waypoints: [],
    optimizeWaypoints: true,
    travelMode: google.maps.DirectionsTravelMode.DRIVING
  };

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

IAmDrivingCtrl.prototype.initialize = function(position) {
  this.geocoder = new google.maps.Geocoder();
  this.myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var mapOptions = {
    center: myLatlng,
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.directionsDisplay = new google.maps.DirectionsRenderer();
  this.map = new google.maps.Map($(".map-canvas").get(0), mapOptions);
  this.directionsDisplay.setMap(this.map);
  this.myMarker = new google.maps.Marker({
    position: this.myLatlng,
    map: this.map,
    title: "I'm here"
  });
};

IAmDrivingCtrl.prototype.showDestination = function(destination) {
  this.destination = destination;
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(this.destination);
  bounds.extend(this.myLatlng);

  this.map.fitBounds(bounds);

  var destinationMarker = new google.maps.Marker({
    map: this.map,
    position: destination,
    title: "Destination"
  });

  this.calculateRoad();
};

IAmDrivingCtrl.prototype.calculateRoad = function() {
  this.directionsServiceRequestOptions.origin = this.myLatlng;
  this.directionsServiceRequestOptions.destination = this.destination;

  this.directionsService.route(this.directionsServiceRequestOptions, angular.bind(this, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      this.directionsDisplay.setDirections(response);

      // For each route, display summary information.
      var route = response.routes[0].legs[0];
      var steps = '';
      for (var i = 0; i < route.steps.length; i++) {
        steps += route.steps[i].start_point;
      }
      console.log(steps);
    }
  }));

};



function ListCtrl($scope, $routeParams) {
};


function latLngToJSON(ll) {
  return JSON.stringify({lat: ll.lat(), lon: ll.lng()});
};