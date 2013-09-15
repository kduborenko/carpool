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
      success(angular.bind(this, function(data) {
        if (data.routesProposals) {
          this.showDriver(data.routesProposals);
        }
      }));
};

PickMeCtrl.prototype.showDriver = function(route) {
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
  // TODO: Hack to get clicks from map cards.
  window.iamdrivingcrtl = this;
  this.map = null;
  this.geocoder = null;
  this.myLatlng = null;
  this.destination = null;
  this.myMarker = null;
  this.directionsDisplay;
  this.directionsService = new google.maps.DirectionsService();
  this.coordInfoWindows = {};
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

  $scope.add = function(a, b) {
    alert(a);
  };
  $scope.remove = function(a) {
    alert(a);
  };
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
      var steps = [];
      for (var i = 0; i < route.steps.length; i++) {
        steps.push({lat: route.steps[i].start_point.lat(), lon: route.steps[i].start_point.lng()});
      }
      console.log(steps);
      this.http({method: 'GET', url: '/driver/registerRoute',
        params: {
          username: 'Vasia',
          route: JSON.stringify(steps)
        }}).success(angular.bind(this, this.showPassengers));
    }
  }));
};

IAmDrivingCtrl.prototype.showPassengers = function(data) {
  if (data.status == 'ok') {
    for (var i = 0; i < data.companions.length; i++) {
      this.showCoordInfoWindow(data.companions[i]);
    }
  }
};


IAmDrivingCtrl.prototype.showCoordInfoWindow = function(pas) {
  var html = '<div class="passenger-card" style="width: 150px;">' +
      '     <img src="img/Anton_Tomchenko.gif" style="width: 30px; height: 40px; float: left; margin-right: 5px"> ' + pas.companionId.substr(0,10) +'<br/>' +
      '     <button type="button" class="btn btn-success btn-xs" onclick="window.iamdrivingcrtl.add(\'' + pas.companionId +'\',\'' + pas.pickupUrl + '\')">Pick him</button>' +
      '      <button type="button" class="btn btn-danger btn-xs" onclick="window.iamdrivingcrtl.remove(\'' + pas.companionId +'\')">Dismiss</button>' +
      '    </div>';
  var latLng = new google.maps.LatLng(pas.from.lat, pas.from.lon);
  var coordInfoWindow = new google.maps.InfoWindow();
  coordInfoWindow.setContent(html);
  coordInfoWindow.setPosition(latLng);
  coordInfoWindow.open(this.map);
  coordInfoWindow.addListener('closeclick', angular.bind(this, this.remove, pas.companionId));
  this.coordInfoWindows[pas.companionId] = coordInfoWindow;
};

IAmDrivingCtrl.prototype.add = function(id, url) {
  this.coordInfoWindows[id].close();
  this.http({method: 'get', url: url});
  delete this.coordInfoWindows[id];
};

IAmDrivingCtrl.prototype.remove = function(id) {
  this.coordInfoWindows[id].close();
  delete this.coordInfoWindows[id];
};


function ListCtrl($scope, $routeParams) {
};


function latLngToJSON(ll) {
  return JSON.stringify({lat: ll.lat(), lon: ll.lng()});
};