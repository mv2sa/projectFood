var sessionStorageKeys = {
	skeleton : 'skeleton_data'
};

var app = angular.module('findMyFood', ['ui.router', 'filters']);

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/dashboard/');
    $stateProvider.state('dashboard', {
		url: '/dashboard/',
		views: {
		  'mainContent': {
		    templateUrl: 'views/dashboard.html',
		    controller: 'dashboard'
		  },
		  'mainMenu': {
		    templateUrl: 'views/menu.html',
		    controller: 'menu'
		  }
		}
	}).state('findIt', {
		url: '/findIt/',
		views: {
		  'mainContent': {
		    templateUrl: 'views/findIt.html',
		    controller: 'findIt'
		  },
		  'mainMenu': {
		    templateUrl: 'views/menu.html',
		    controller: 'menu'
		  }
		}
	}).state('configure', {
		url: '/configure/',
		views: {
		  'mainContent': {
		    templateUrl: 'views/configure.html',
		    controller: 'configure'
		  },
		  'mainMenu': {
		    templateUrl: 'views/menu.html',
		    controller: 'menu'
		  }
		}
	}).state('history', {
		url: '/history/',
		views: {
		  'mainContent': {
		    templateUrl: 'views/history.html',
		    controller: 'history'
		  },
		  'mainMenu': {
		    templateUrl: 'views/menu.html',
		    controller: 'menu'
		  }
		}
	}).state('aboutIt', {
		url: '/aboutIt/',
		views: {
		  'mainContent': {
		    templateUrl: 'views/aboutIt.html',
		    controller: 'aboutIt'
		  },
		  'mainMenu': {
		    templateUrl: 'views/menu.html',
		    controller: 'menu'
		  }
		}
	});
});

app.run(function($rootScope, $urlRouter, $window) {
	$rootScope.$on('$locationChangeSuccess', function(evt) {
		angular.element($window.document.getElementsByTagName('body')).removeClass('activeMenu');
	});
});

app.controller('dashboard', function($scope, skeletonFactory) {
	$scope.dashboardItems = {
		loading : true
	};

	var init = function() {
		var storedData;

		storedData = skeletonFactory.getStoredSkeleton();
		if(storedData === null) {
			skeletonFactory.getSkeleton().then(function(d){
				$scope.dashboardItems.dashboard = d.dashboard;
				$scope.dashboardItems.loading = false;
			});
		} else {
			$scope.dashboardItems.dashboard = storedData.dashboard;
			$scope.dashboardItems.loading = false;
		}
		
	};

	init();
});

app.controller('menu', function($scope, $location, $window, skeletonFactory) {
	$scope.navigation = {
		path : $location.path(),
		loading : true
	};

	var init = function() {
		var storedData;

		angular.element($window.document.getElementById('hamburguerMenu')).on('click', function(event) {
			event.preventDefault();
			var body = $window.document.getElementsByTagName('body');
			if (angular.element(body).hasClass('activeMenu')) {
				angular.element(body).removeClass('activeMenu');
			} else {
				angular.element(body).addClass('activeMenu');
			}
		});

		storedData = skeletonFactory.getStoredSkeleton();
		if(storedData === null) {
			skeletonFactory.getSkeleton().then(function(d){
				$scope.navigation.menu = d.menu;
				$scope.navigation.loading = false;
			});
		} else {
			$scope.navigation.menu = storedData.menu;
			$scope.navigation.loading = false;
		}
	};

	init();
});

app.controller('findIt', function($scope, $window, trackPosition, googleMaps) {
	$scope.findIt = {
		position : false,
		map : false,
		showMap : false,
		showInitial : true,
		showOverlay : false,
		showOverlayLoading : false,
		configuration : [],
		markers : [],
		places : false,
		screenHeight : 0
	};

	$scope.bigRedButton = function() {
		trackPosition.getCoords().then(function(d) {
			$scope.findIt.position = new google.maps.LatLng(d[0], d[1]);
			$scope.findIt.loading = true;
			if ($scope.findIt.map === false) {
				$scope.findIt.map = new google.maps.Map($window.document.getElementById('maps'), {
			    	center: $scope.findIt.position,
			    	zoom: 13
			    });
			    google.maps.event.addDomListener($window, "resize", function() {
					resizeMap();
				});
			} else {
				$scope.findIt.map.setCenter($scope.findIt.position);
				$scope.findIt.map.setZoom(13);
				removeAllMarkers();
			}
			addYouMarker();
			$scope.findIt.showMap = true;
			$scope.findIt.showInitial = false;
			$scope.findIt.showOverlay = true;
			$scope.findIt.showOverlayLoading = true;
			resizeMap();
		});
	};

	var getPlaces = function () {
		googleMaps.getPlaces($scope.findIt.map, $scope.findIt.position, 10/* radius */ * 1609.34, $scope.findIt.configuration).then(function(d){
			$scope.findIt.places = d;
			if ($scope.findIt.places.error) {
				// removeAllMarkers();
				addYouMarker();
			} else {
				// addMarkers();
			}

		});
	};

	var addYouMarker = function () {
		var marker = new google.maps.Marker({
		    position: $scope.findIt.map.getCenter(),
		    map: $scope.findIt.map,
		    title: 'You'
		});
		$scope.findIt.markers.push(marker);
	};

	var addMarkers = function () {
		// for (var i = 0; i < $scope.places.length; i++) {
		// 	var marker = new google.map.Marker({
		// 		map: $scope.maps,
		// 		animation: google.maps.Animation.DROP,
		// 		icon: new google.maps.MarkerImage(
  //       			'http://maps.google.com/mapfiles/kml/paddle/' + String.fromCharCode(i + 65) + '.png',
  //       			new google.maps.Size(30, 30),
  //       			new google.maps.Point(0, 0),
  //       			new google.maps.Point(15, 15),
  //       			new google.maps.Size(30, 30)
		// 	    ),
		// 		position: $scope.places[i].geometry.location,
		// 		title: $scope.places[i].name
		// 	});
		// 	var markerClickEvent = google.maps.event.addListener(marker, 'click', function(id, index) {
		// 		return function() {$scope.showDetails(index, id);$scope.$digest();}
		// 	}($scope.places[i].place_id, i+1));
		// 	$scope.markers.push(marker);
		// 	$scope.markersListeners.push(markerClickEvent);
		// }
	};

	var removeAllMarkers = function () {
		for (var i = 0; i < $scope.findIt.markers.length; i++) {
			$scope.findIt.markers[i].setMap(null);
		}
		$scope.findIt.markers = [];
		// for (var i = 0; i < $scope.markersListeners.length; i++) {
		// 	google.maps.event.removeListener($scope.markersListeners[i]);
		// }
		// $scope.markersListeners = [];
	};

	var resizeMap = function () {
		var center = $scope.findIt.map.getCenter();
		google.maps.event.trigger($scope.findIt.map, 'resize');
		$scope.findIt.map.setCenter(center);
	};

	var adjustHeight = function(elements) {
		var windowHeight = $window.innerHeight || $window.document.documentElement.clientHeight || $window.document.getElementsByTagName('body')[0].clientHeight;
		for (var i = 0; i < elements.length; i++) {
			angular.element(elements[i]).css('height', (windowHeight - 48 - 38) + 'px');
		}
	};

	var init = function() {

		adjustHeight($window.document.querySelectorAll('.makeItFit'));
		angular.element($window).bind('resize', function() {
			adjustHeight($window.document.querySelectorAll('.makeItFit'));
		});

	};

	init();


});

app.factory('skeletonFactory', function($http, $window) {

	var factory = {};

	factory.getStoredSkeleton = function() {
		if ($window.Modernizr.sessionstorage) {
			return $window.JSON.parse($window.sessionStorage.getItem($window.sessionStorageKeys.skeleton));
		}
	};

	factory.getSkeleton = function() {
		var promise = $http.get('json/skeleton.json').then(function (results) {
			if ($window.Modernizr.sessionstorage) {
				$window.sessionStorage.setItem($window.sessionStorageKeys.skeleton, $window.JSON.stringify(results.data));
			}
			return results.data;
		});
		return promise;
	};

	return factory;
});

app.factory('trackPosition', ['$q', '$window', '$rootScope', function ($q, $window, $rootScope) {

	var factory = {};

	factory.getCoords = function() {
		var deferred = $q.defer();
		if (Modernizr.geolocation) {
            $window.navigator.geolocation.getCurrentPosition(function (position) {
                $rootScope.$apply(function() {
                    deferred.resolve([position.coords.latitude, position.coords.longitude]);
                });
            }, function (error) {
                $rootScope.$apply(function() {
                    deferred.reject(error);
                });
            });
		} else {
            $rootScope.$apply(function() {
                deferred.reject(new Error("Geolocation is not supported"));
            });
		}
		return deferred.promise;
	};

	return factory;

}]);

app.factory('googleMaps', ['$q', '$rootScope', function ($q, $rootScope) {

	var factory = {};

	factory.getPlaces = function(map, coords, area, interests) {
		var deferred = $q.defer();
		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch({location : coords, radius : area, types : interests}, function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
                $rootScope.$apply(function() {
                    deferred.resolve(results);
                });
			} else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
				deferred.reject('Nothing Found');
			} else {
				deferred.reject('Service Unavailable');
			}	
		});
		return deferred.promise;
	};

	factory.getPlaceDetail = function(map, id) {
		var deferred = $q.defer();
		var service = new google.maps.places.PlacesService(map);
		service.getDetails({placeId : id}, function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				if (results.photos) {
					for (var i = 0; results.photos.length > i; i++) {
						results.photos[i].photoSmall = results.photos[i].getUrl({'maxWidth': 100, 'maxHeight': 100});
						results.photos[i].photoBig = results.photos[i].getUrl({'maxWidth': 600, 'maxHeight': 600});
					}
				}
				results.overlayImage = false;
				results.overlayRatings = false;
                $rootScope.$apply(function() {
                    deferred.resolve(results);
                });
			} else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
				deferred.reject({error : 'Nothing Found'});
			} else {
				deferred.reject({error : 'Service Unavailable'});
			}
		});
		return deferred.promise;
	};

	return factory;
}]);

angular.module('filters', [])
	.filter('underscoreToSpace', function () {
		return function (input) {
			if (input) {
				return input.toLowerCase().replace(/_/g, ' ');
			}
		};
	}
).filter('toAZ', function () {
		return function (input) {
			if (input) {
				if (input <= 26 && input >= 1) {
					return String.fromCharCode(input + 64);
				} else {
					return input;
				}
			}
		};
	}
).filter('ratingToStar', function () {
		return function (input) {
			if (typeof input === "number") {
				if (input <= 5 && input >= 1) {
					var fullStar = Math.round(input),
						string = "";
					for (var i = 0; i < fullStar; i++)  {
						string = string + "&#xf005; "
					} 
					return string;
				} else {
					return input;
				}
			}
		};
	}
).filter('priceRating', function () {
		return function (input) {
			if (typeof input === "number") {
				if (input <= 4 && input >= 0) {
					var string = "";
					for (var i = 0; i <= input; i++)  {
						string = string + "&#xf155; "
					} 
					return string;
				} else {
					return input;
				}
			}
		};
	}
).filter('toHTML', ['$sce', function ($sce) {
		return function (input) {
			if (input) {
				return $sce.trustAsHtml(input);
			}
		};
	}]
);